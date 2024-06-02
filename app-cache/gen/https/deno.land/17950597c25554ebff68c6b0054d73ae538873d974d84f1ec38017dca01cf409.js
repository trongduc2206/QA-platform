import { sendCommand } from "./protocol/mod.ts";
import { exponentialBackoff } from "./backoff.ts";
import { ErrorReplyError, isRetriableError } from "./errors.ts";
import { BufReader } from "./vendor/https/deno.land/std/io/buf_reader.ts";
import { BufWriter } from "./vendor/https/deno.land/std/io/buf_writer.ts";
import { deferred } from "./vendor/https/deno.land/std/async/deferred.ts";
import { delay } from "./vendor/https/deno.land/std/async/delay.ts";
export const kEmptyRedisArgs = [];
export class RedisConnection {
    name;
    reader;
    writer;
    closer;
    maxRetryCount;
    hostname;
    port;
    _isClosed;
    _isConnected;
    backoff;
    commandQueue;
    get isClosed() {
        return this._isClosed;
    }
    get isConnected() {
        return this._isConnected;
    }
    get isRetriable() {
        return this.maxRetryCount > 0;
    }
    constructor(hostname, port, options){
        this.options = options;
        this.name = null;
        this.maxRetryCount = 10;
        this._isClosed = false;
        this._isConnected = false;
        this.commandQueue = [];
        this.hostname = hostname;
        this.port = port;
        if (options.name) {
            this.name = options.name;
        }
        if (options.maxRetryCount != null) {
            this.maxRetryCount = options.maxRetryCount;
        }
        this.backoff = options.backoff ?? exponentialBackoff();
    }
    async authenticate(username, password) {
        try {
            password && username ? await this.sendCommand("AUTH", [
                username,
                password
            ]) : await this.sendCommand("AUTH", [
                password
            ]);
        } catch (error) {
            if (error instanceof ErrorReplyError) {
                throw new AuthenticationError("Authentication failed", {
                    cause: error
                });
            } else {
                throw error;
            }
        }
    }
    async selectDb(db = this.options.db) {
        if (!db) throw new Error("The database index is undefined.");
        await this.sendCommand("SELECT", [
            db
        ]);
    }
    sendCommand(command, args, options) {
        const promise = deferred();
        this.commandQueue.push({
            name: command,
            args: args ?? kEmptyRedisArgs,
            promise,
            returnUint8Arrays: options?.returnUint8Arrays
        });
        if (this.commandQueue.length === 1) {
            this.processCommandQueue();
        }
        return promise;
    }
    /**
   * Connect to Redis server
   */ async connect() {
        await this.#connect(0);
    }
    async #connect(retryCount) {
        try {
            const dialOpts = {
                hostname: this.hostname,
                port: parsePortLike(this.port)
            };
            const conn = this.options?.tls ? await Deno.connectTls(dialOpts) : await Deno.connect(dialOpts);
            this.closer = conn;
            this.reader = new BufReader(conn);
            this.writer = new BufWriter(conn);
            this._isClosed = false;
            this._isConnected = true;
            try {
                if (this.options.password != null) {
                    await this.authenticate(this.options.username, this.options.password);
                }
                if (this.options.db) {
                    await this.selectDb(this.options.db);
                }
            } catch (error) {
                this.close();
                throw error;
            }
            this.#enableHealthCheckIfNeeded();
        } catch (error) {
            if (error instanceof AuthenticationError) {
                throw error.cause ?? error;
            }
            const backoff = this.backoff(retryCount);
            retryCount++;
            if (retryCount >= this.maxRetryCount) {
                throw error;
            }
            await delay(backoff);
            await this.#connect(retryCount);
        }
    }
    close() {
        this._isClosed = true;
        this._isConnected = false;
        try {
            this.closer.close();
        } catch (error) {
            if (!(error instanceof Deno.errors.BadResource)) throw error;
        }
    }
    async reconnect() {
        if (!this.reader.peek(1)) {
            throw new Error("Client is closed.");
        }
        try {
            await this.sendCommand("PING");
            this._isConnected = true;
        } catch (_error) {
            this.close();
            await this.connect();
            await this.sendCommand("PING");
        }
    }
    async processCommandQueue() {
        const [command] = this.commandQueue;
        if (!command) return;
        try {
            const reply = await sendCommand(this.writer, this.reader, command.name, command.args, command.returnUint8Arrays);
            command.promise.resolve(reply);
        } catch (error) {
            if (!isRetriableError(error) || this.isManuallyClosedByUser()) {
                return command.promise.reject(error);
            }
            for(let i = 0; i < this.maxRetryCount; i++){
                // Try to reconnect to the server and retry the command
                this.close();
                try {
                    await this.connect();
                    const reply = await sendCommand(this.writer, this.reader, command.name, command.args, command.returnUint8Arrays);
                    return command.promise.resolve(reply);
                } catch  {
                    const backoff = this.backoff(i);
                    await delay(backoff);
                }
            }
            command.promise.reject(error);
        } finally{
            this.commandQueue.shift();
            this.processCommandQueue();
        }
    }
    isManuallyClosedByUser() {
        return this._isClosed && !this._isConnected;
    }
    #enableHealthCheckIfNeeded() {
        const { healthCheckInterval  } = this.options;
        if (healthCheckInterval == null) {
            return;
        }
        const ping = async ()=>{
            if (this.isManuallyClosedByUser()) {
                return;
            }
            try {
                await this.sendCommand("PING");
                this._isConnected = true;
            } catch  {
                // TODO: notify the user of an error
                this._isConnected = false;
            } finally{
                setTimeout(ping, healthCheckInterval);
            }
        };
        setTimeout(ping, healthCheckInterval);
    }
    options;
}
class AuthenticationError extends Error {
}
function parsePortLike(port) {
    let parsedPort;
    if (typeof port === "string") {
        parsedPort = parseInt(port);
    } else if (typeof port === "number") {
        parsedPort = port;
    } else {
        parsedPort = 6379;
    }
    if (!Number.isSafeInteger(parsedPort)) {
        throw new Error("Port is invalid");
    }
    return parsedPort;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvcmVkaXNAdjAuMzEuMC9jb25uZWN0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHNlbmRDb21tYW5kIH0gZnJvbSBcIi4vcHJvdG9jb2wvbW9kLnRzXCI7XG5pbXBvcnQgdHlwZSB7IFJlZGlzUmVwbHksIFJlZGlzVmFsdWUgfSBmcm9tIFwiLi9wcm90b2NvbC9tb2QudHNcIjtcbmltcG9ydCB0eXBlIHsgQmFja29mZiB9IGZyb20gXCIuL2JhY2tvZmYudHNcIjtcbmltcG9ydCB7IGV4cG9uZW50aWFsQmFja29mZiB9IGZyb20gXCIuL2JhY2tvZmYudHNcIjtcbmltcG9ydCB7IEVycm9yUmVwbHlFcnJvciwgaXNSZXRyaWFibGVFcnJvciB9IGZyb20gXCIuL2Vycm9ycy50c1wiO1xuaW1wb3J0IHsgQnVmUmVhZGVyIH0gZnJvbSBcIi4vdmVuZG9yL2h0dHBzL2Rlbm8ubGFuZC9zdGQvaW8vYnVmX3JlYWRlci50c1wiO1xuaW1wb3J0IHsgQnVmV3JpdGVyIH0gZnJvbSBcIi4vdmVuZG9yL2h0dHBzL2Rlbm8ubGFuZC9zdGQvaW8vYnVmX3dyaXRlci50c1wiO1xuaW1wb3J0IHtcbiAgRGVmZXJyZWQsXG4gIGRlZmVycmVkLFxufSBmcm9tIFwiLi92ZW5kb3IvaHR0cHMvZGVuby5sYW5kL3N0ZC9hc3luYy9kZWZlcnJlZC50c1wiO1xuaW1wb3J0IHsgZGVsYXkgfSBmcm9tIFwiLi92ZW5kb3IvaHR0cHMvZGVuby5sYW5kL3N0ZC9hc3luYy9kZWxheS50c1wiO1xudHlwZSBDbG9zZXIgPSBEZW5vLkNsb3NlcjtcblxuZXhwb3J0IGludGVyZmFjZSBTZW5kQ29tbWFuZE9wdGlvbnMge1xuICAvKipcbiAgICogV2hlbiB0aGlzIG9wdGlvbiBpcyBzZXQsIHNpbXBsZSBvciBidWxrIHN0cmluZyByZXBsaWVzIGFyZSByZXR1cm5lZCBhcyBgVWludDhBcnJheWAgdHlwZS5cbiAgICpcbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHJldHVyblVpbnQ4QXJyYXlzPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb25uZWN0aW9uIHtcbiAgcmVhZGVyOiBCdWZSZWFkZXI7XG4gIHdyaXRlcjogQnVmV3JpdGVyO1xuICBpc0Nsb3NlZDogYm9vbGVhbjtcbiAgaXNDb25uZWN0ZWQ6IGJvb2xlYW47XG4gIGNsb3NlKCk6IHZvaWQ7XG4gIGNvbm5lY3QoKTogUHJvbWlzZTx2b2lkPjtcbiAgcmVjb25uZWN0KCk6IFByb21pc2U8dm9pZD47XG4gIHNlbmRDb21tYW5kKFxuICAgIGNvbW1hbmQ6IHN0cmluZyxcbiAgICBhcmdzPzogQXJyYXk8UmVkaXNWYWx1ZT4sXG4gICAgb3B0aW9ucz86IFNlbmRDb21tYW5kT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxSZWRpc1JlcGx5Pjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZWRpc0Nvbm5lY3Rpb25PcHRpb25zIHtcbiAgdGxzPzogYm9vbGVhbjtcbiAgZGI/OiBudW1iZXI7XG4gIHBhc3N3b3JkPzogc3RyaW5nO1xuICB1c2VybmFtZT86IHN0cmluZztcbiAgbmFtZT86IHN0cmluZztcbiAgLyoqXG4gICAqIEBkZWZhdWx0IDEwXG4gICAqL1xuICBtYXhSZXRyeUNvdW50PzogbnVtYmVyO1xuICBiYWNrb2ZmPzogQmFja29mZjtcbiAgLyoqXG4gICAqIFdoZW4gdGhpcyBvcHRpb24gaXMgc2V0LCBhIGBQSU5HYCBjb21tYW5kIGlzIHNlbnQgZXZlcnkgc3BlY2lmaWVkIG51bWJlciBvZiBzZWNvbmRzLlxuICAgKi9cbiAgaGVhbHRoQ2hlY2tJbnRlcnZhbD86IG51bWJlcjtcbn1cblxuZXhwb3J0IGNvbnN0IGtFbXB0eVJlZGlzQXJnczogQXJyYXk8UmVkaXNWYWx1ZT4gPSBbXTtcblxuaW50ZXJmYWNlIENvbW1hbmQge1xuICBuYW1lOiBzdHJpbmc7XG4gIGFyZ3M6IFJlZGlzVmFsdWVbXTtcbiAgcHJvbWlzZTogRGVmZXJyZWQ8UmVkaXNSZXBseT47XG4gIHJldHVyblVpbnQ4QXJyYXlzPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIFJlZGlzQ29ubmVjdGlvbiBpbXBsZW1lbnRzIENvbm5lY3Rpb24ge1xuICBuYW1lOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgcmVhZGVyITogQnVmUmVhZGVyO1xuICB3cml0ZXIhOiBCdWZXcml0ZXI7XG4gIHByaXZhdGUgY2xvc2VyITogQ2xvc2VyO1xuICBwcml2YXRlIG1heFJldHJ5Q291bnQgPSAxMDtcblxuICBwcml2YXRlIHJlYWRvbmx5IGhvc3RuYW1lOiBzdHJpbmc7XG4gIHByaXZhdGUgcmVhZG9ubHkgcG9ydDogbnVtYmVyIHwgc3RyaW5nO1xuICBwcml2YXRlIF9pc0Nsb3NlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9pc0Nvbm5lY3RlZCA9IGZhbHNlO1xuICBwcml2YXRlIGJhY2tvZmY6IEJhY2tvZmY7XG5cbiAgcHJpdmF0ZSBjb21tYW5kUXVldWU6IENvbW1hbmRbXSA9IFtdO1xuXG4gIGdldCBpc0Nsb3NlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNDbG9zZWQ7XG4gIH1cblxuICBnZXQgaXNDb25uZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzQ29ubmVjdGVkO1xuICB9XG5cbiAgZ2V0IGlzUmV0cmlhYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm1heFJldHJ5Q291bnQgPiAwO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgaG9zdG5hbWU6IHN0cmluZyxcbiAgICBwb3J0OiBudW1iZXIgfCBzdHJpbmcsXG4gICAgcHJpdmF0ZSBvcHRpb25zOiBSZWRpc0Nvbm5lY3Rpb25PcHRpb25zLFxuICApIHtcbiAgICB0aGlzLmhvc3RuYW1lID0gaG9zdG5hbWU7XG4gICAgdGhpcy5wb3J0ID0gcG9ydDtcbiAgICBpZiAob3B0aW9ucy5uYW1lKSB7XG4gICAgICB0aGlzLm5hbWUgPSBvcHRpb25zLm5hbWU7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLm1heFJldHJ5Q291bnQgIT0gbnVsbCkge1xuICAgICAgdGhpcy5tYXhSZXRyeUNvdW50ID0gb3B0aW9ucy5tYXhSZXRyeUNvdW50O1xuICAgIH1cbiAgICB0aGlzLmJhY2tvZmYgPSBvcHRpb25zLmJhY2tvZmYgPz8gZXhwb25lbnRpYWxCYWNrb2ZmKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGF1dGhlbnRpY2F0ZShcbiAgICB1c2VybmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHBhc3N3b3JkOiBzdHJpbmcsXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICBwYXNzd29yZCAmJiB1c2VybmFtZVxuICAgICAgICA/IGF3YWl0IHRoaXMuc2VuZENvbW1hbmQoXCJBVVRIXCIsIFt1c2VybmFtZSwgcGFzc3dvcmRdKVxuICAgICAgICA6IGF3YWl0IHRoaXMuc2VuZENvbW1hbmQoXCJBVVRIXCIsIFtwYXNzd29yZF0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvclJlcGx5RXJyb3IpIHtcbiAgICAgICAgdGhyb3cgbmV3IEF1dGhlbnRpY2F0aW9uRXJyb3IoXCJBdXRoZW50aWNhdGlvbiBmYWlsZWRcIiwge1xuICAgICAgICAgIGNhdXNlOiBlcnJvcixcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHNlbGVjdERiKFxuICAgIGRiOiBudW1iZXIgfCB1bmRlZmluZWQgPSB0aGlzLm9wdGlvbnMuZGIsXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghZGIpIHRocm93IG5ldyBFcnJvcihcIlRoZSBkYXRhYmFzZSBpbmRleCBpcyB1bmRlZmluZWQuXCIpO1xuICAgIGF3YWl0IHRoaXMuc2VuZENvbW1hbmQoXCJTRUxFQ1RcIiwgW2RiXSk7XG4gIH1cblxuICBzZW5kQ29tbWFuZChcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgYXJncz86IEFycmF5PFJlZGlzVmFsdWU+LFxuICAgIG9wdGlvbnM/OiBTZW5kQ29tbWFuZE9wdGlvbnMsXG4gICk6IFByb21pc2U8UmVkaXNSZXBseT4ge1xuICAgIGNvbnN0IHByb21pc2UgPSBkZWZlcnJlZDxSZWRpc1JlcGx5PigpO1xuICAgIHRoaXMuY29tbWFuZFF1ZXVlLnB1c2goe1xuICAgICAgbmFtZTogY29tbWFuZCxcbiAgICAgIGFyZ3M6IGFyZ3MgPz8ga0VtcHR5UmVkaXNBcmdzLFxuICAgICAgcHJvbWlzZSxcbiAgICAgIHJldHVyblVpbnQ4QXJyYXlzOiBvcHRpb25zPy5yZXR1cm5VaW50OEFycmF5cyxcbiAgICB9KTtcbiAgICBpZiAodGhpcy5jb21tYW5kUXVldWUubGVuZ3RoID09PSAxKSB7XG4gICAgICB0aGlzLnByb2Nlc3NDb21tYW5kUXVldWUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogQ29ubmVjdCB0byBSZWRpcyBzZXJ2ZXJcbiAgICovXG4gIGFzeW5jIGNvbm5lY3QoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy4jY29ubmVjdCgwKTtcbiAgfVxuXG4gIGFzeW5jICNjb25uZWN0KHJldHJ5Q291bnQ6IG51bWJlcikge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkaWFsT3B0czogRGVuby5Db25uZWN0T3B0aW9ucyA9IHtcbiAgICAgICAgaG9zdG5hbWU6IHRoaXMuaG9zdG5hbWUsXG4gICAgICAgIHBvcnQ6IHBhcnNlUG9ydExpa2UodGhpcy5wb3J0KSxcbiAgICAgIH07XG4gICAgICBjb25zdCBjb25uOiBEZW5vLkNvbm4gPSB0aGlzLm9wdGlvbnM/LnRsc1xuICAgICAgICA/IGF3YWl0IERlbm8uY29ubmVjdFRscyhkaWFsT3B0cylcbiAgICAgICAgOiBhd2FpdCBEZW5vLmNvbm5lY3QoZGlhbE9wdHMpO1xuXG4gICAgICB0aGlzLmNsb3NlciA9IGNvbm47XG4gICAgICB0aGlzLnJlYWRlciA9IG5ldyBCdWZSZWFkZXIoY29ubik7XG4gICAgICB0aGlzLndyaXRlciA9IG5ldyBCdWZXcml0ZXIoY29ubik7XG4gICAgICB0aGlzLl9pc0Nsb3NlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5faXNDb25uZWN0ZWQgPSB0cnVlO1xuXG4gICAgICB0cnkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBhc3N3b3JkICE9IG51bGwpIHtcbiAgICAgICAgICBhd2FpdCB0aGlzLmF1dGhlbnRpY2F0ZSh0aGlzLm9wdGlvbnMudXNlcm5hbWUsIHRoaXMub3B0aW9ucy5wYXNzd29yZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kYikge1xuICAgICAgICAgIGF3YWl0IHRoaXMuc2VsZWN0RGIodGhpcy5vcHRpb25zLmRiKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cblxuICAgICAgdGhpcy4jZW5hYmxlSGVhbHRoQ2hlY2tJZk5lZWRlZCgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBBdXRoZW50aWNhdGlvbkVycm9yKSB7XG4gICAgICAgIHRocm93IChlcnJvci5jYXVzZSA/PyBlcnJvcik7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGJhY2tvZmYgPSB0aGlzLmJhY2tvZmYocmV0cnlDb3VudCk7XG4gICAgICByZXRyeUNvdW50Kys7XG4gICAgICBpZiAocmV0cnlDb3VudCA+PSB0aGlzLm1heFJldHJ5Q291bnQpIHtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgICBhd2FpdCBkZWxheShiYWNrb2ZmKTtcbiAgICAgIGF3YWl0IHRoaXMuI2Nvbm5lY3QocmV0cnlDb3VudCk7XG4gICAgfVxuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgdGhpcy5faXNDbG9zZWQgPSB0cnVlO1xuICAgIHRoaXMuX2lzQ29ubmVjdGVkID0gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuY2xvc2VyIS5jbG9zZSgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLkJhZFJlc291cmNlKSkgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcmVjb25uZWN0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5yZWFkZXIucGVlaygxKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2xpZW50IGlzIGNsb3NlZC5cIik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLnNlbmRDb21tYW5kKFwiUElOR1wiKTtcbiAgICAgIHRoaXMuX2lzQ29ubmVjdGVkID0gdHJ1ZTtcbiAgICB9IGNhdGNoIChfZXJyb3IpIHsgLy8gVE9ETzogTWF5YmUgd2Ugc2hvdWxkIGxvZyB0aGlzIGVycm9yLlxuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgYXdhaXQgdGhpcy5jb25uZWN0KCk7XG4gICAgICBhd2FpdCB0aGlzLnNlbmRDb21tYW5kKFwiUElOR1wiKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHByb2Nlc3NDb21tYW5kUXVldWUoKSB7XG4gICAgY29uc3QgW2NvbW1hbmRdID0gdGhpcy5jb21tYW5kUXVldWU7XG4gICAgaWYgKCFjb21tYW5kKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVwbHkgPSBhd2FpdCBzZW5kQ29tbWFuZChcbiAgICAgICAgdGhpcy53cml0ZXIsXG4gICAgICAgIHRoaXMucmVhZGVyLFxuICAgICAgICBjb21tYW5kLm5hbWUsXG4gICAgICAgIGNvbW1hbmQuYXJncyxcbiAgICAgICAgY29tbWFuZC5yZXR1cm5VaW50OEFycmF5cyxcbiAgICAgICk7XG4gICAgICBjb21tYW5kLnByb21pc2UucmVzb2x2ZShyZXBseSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmIChcbiAgICAgICAgIWlzUmV0cmlhYmxlRXJyb3IoZXJyb3IpIHx8XG4gICAgICAgIHRoaXMuaXNNYW51YWxseUNsb3NlZEJ5VXNlcigpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIGNvbW1hbmQucHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubWF4UmV0cnlDb3VudDsgaSsrKSB7XG4gICAgICAgIC8vIFRyeSB0byByZWNvbm5lY3QgdG8gdGhlIHNlcnZlciBhbmQgcmV0cnkgdGhlIGNvbW1hbmRcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IHRoaXMuY29ubmVjdCgpO1xuXG4gICAgICAgICAgY29uc3QgcmVwbHkgPSBhd2FpdCBzZW5kQ29tbWFuZChcbiAgICAgICAgICAgIHRoaXMud3JpdGVyLFxuICAgICAgICAgICAgdGhpcy5yZWFkZXIsXG4gICAgICAgICAgICBjb21tYW5kLm5hbWUsXG4gICAgICAgICAgICBjb21tYW5kLmFyZ3MsXG4gICAgICAgICAgICBjb21tYW5kLnJldHVyblVpbnQ4QXJyYXlzLFxuICAgICAgICAgICk7XG5cbiAgICAgICAgICByZXR1cm4gY29tbWFuZC5wcm9taXNlLnJlc29sdmUocmVwbHkpO1xuICAgICAgICB9IGNhdGNoIHsgLy8gVE9ETzogdXNlIGBBZ2dyZWdhdGVFcnJvcmA/XG4gICAgICAgICAgY29uc3QgYmFja29mZiA9IHRoaXMuYmFja29mZihpKTtcbiAgICAgICAgICBhd2FpdCBkZWxheShiYWNrb2ZmKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb21tYW5kLnByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5jb21tYW5kUXVldWUuc2hpZnQoKTtcbiAgICAgIHRoaXMucHJvY2Vzc0NvbW1hbmRRdWV1ZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaXNNYW51YWxseUNsb3NlZEJ5VXNlcigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNDbG9zZWQgJiYgIXRoaXMuX2lzQ29ubmVjdGVkO1xuICB9XG5cbiAgI2VuYWJsZUhlYWx0aENoZWNrSWZOZWVkZWQoKSB7XG4gICAgY29uc3QgeyBoZWFsdGhDaGVja0ludGVydmFsIH0gPSB0aGlzLm9wdGlvbnM7XG4gICAgaWYgKGhlYWx0aENoZWNrSW50ZXJ2YWwgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBpbmcgPSBhc3luYyAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5pc01hbnVhbGx5Q2xvc2VkQnlVc2VyKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLnNlbmRDb21tYW5kKFwiUElOR1wiKTtcbiAgICAgICAgdGhpcy5faXNDb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIFRPRE86IG5vdGlmeSB0aGUgdXNlciBvZiBhbiBlcnJvclxuICAgICAgICB0aGlzLl9pc0Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgc2V0VGltZW91dChwaW5nLCBoZWFsdGhDaGVja0ludGVydmFsKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgc2V0VGltZW91dChwaW5nLCBoZWFsdGhDaGVja0ludGVydmFsKTtcbiAgfVxufVxuXG5jbGFzcyBBdXRoZW50aWNhdGlvbkVycm9yIGV4dGVuZHMgRXJyb3Ige31cblxuZnVuY3Rpb24gcGFyc2VQb3J0TGlrZShwb3J0OiBzdHJpbmcgfCBudW1iZXIgfCB1bmRlZmluZWQpOiBudW1iZXIge1xuICBsZXQgcGFyc2VkUG9ydDogbnVtYmVyO1xuICBpZiAodHlwZW9mIHBvcnQgPT09IFwic3RyaW5nXCIpIHtcbiAgICBwYXJzZWRQb3J0ID0gcGFyc2VJbnQocG9ydCk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHBvcnQgPT09IFwibnVtYmVyXCIpIHtcbiAgICBwYXJzZWRQb3J0ID0gcG9ydDtcbiAgfSBlbHNlIHtcbiAgICBwYXJzZWRQb3J0ID0gNjM3OTtcbiAgfVxuICBpZiAoIU51bWJlci5pc1NhZmVJbnRlZ2VyKHBhcnNlZFBvcnQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiUG9ydCBpcyBpbnZhbGlkXCIpO1xuICB9XG4gIHJldHVybiBwYXJzZWRQb3J0O1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsV0FBVyxRQUFRLG9CQUFvQjtBQUdoRCxTQUFTLGtCQUFrQixRQUFRLGVBQWU7QUFDbEQsU0FBUyxlQUFlLEVBQUUsZ0JBQWdCLFFBQVEsY0FBYztBQUNoRSxTQUFTLFNBQVMsUUFBUSxnREFBZ0Q7QUFDMUUsU0FBUyxTQUFTLFFBQVEsZ0RBQWdEO0FBQzFFLFNBRUUsUUFBUSxRQUNILGlEQUFpRDtBQUN4RCxTQUFTLEtBQUssUUFBUSw4Q0FBOEM7QUE0Q3BFLE9BQU8sTUFBTSxrQkFBcUMsRUFBRSxDQUFDO0FBU3JELE9BQU8sTUFBTTtJQUNYLEtBQTJCO0lBQzNCLE9BQW1CO0lBQ25CLE9BQW1CO0lBQ1gsT0FBZ0I7SUFDaEIsY0FBbUI7SUFFVixTQUFpQjtJQUNqQixLQUFzQjtJQUMvQixVQUFrQjtJQUNsQixhQUFxQjtJQUNyQixRQUFpQjtJQUVqQixhQUE2QjtJQUVyQyxJQUFJLFdBQW9CO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLFNBQVM7SUFDdkI7SUFFQSxJQUFJLGNBQXVCO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLFlBQVk7SUFDMUI7SUFFQSxJQUFJLGNBQXVCO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLGFBQWEsR0FBRztJQUM5QjtJQUVBLFlBQ0UsUUFBZ0IsRUFDaEIsSUFBcUIsRUFDYixRQUNSO3VCQURRO2FBN0JWLE9BQXNCLElBQUk7YUFJbEIsZ0JBQWdCO2FBSWhCLFlBQVksS0FBSzthQUNqQixlQUFlLEtBQUs7YUFHcEIsZUFBMEIsRUFBRTtRQW1CbEMsSUFBSSxDQUFDLFFBQVEsR0FBRztRQUNoQixJQUFJLENBQUMsSUFBSSxHQUFHO1FBQ1osSUFBSSxRQUFRLElBQUksRUFBRTtZQUNoQixJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsSUFBSTtRQUMxQixDQUFDO1FBQ0QsSUFBSSxRQUFRLGFBQWEsSUFBSSxJQUFJLEVBQUU7WUFDakMsSUFBSSxDQUFDLGFBQWEsR0FBRyxRQUFRLGFBQWE7UUFDNUMsQ0FBQztRQUNELElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxPQUFPLElBQUk7SUFDcEM7SUFFQSxNQUFjLGFBQ1osUUFBNEIsRUFDNUIsUUFBZ0IsRUFDRDtRQUNmLElBQUk7WUFDRixZQUFZLFdBQ1IsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVE7Z0JBQUM7Z0JBQVU7YUFBUyxJQUNuRCxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUTtnQkFBQzthQUFTLENBQUM7UUFDaEQsRUFBRSxPQUFPLE9BQU87WUFDZCxJQUFJLGlCQUFpQixpQkFBaUI7Z0JBQ3BDLE1BQU0sSUFBSSxvQkFBb0IseUJBQXlCO29CQUNyRCxPQUFPO2dCQUNULEdBQUc7WUFDTCxPQUFPO2dCQUNMLE1BQU0sTUFBTTtZQUNkLENBQUM7UUFDSDtJQUNGO0lBRUEsTUFBYyxTQUNaLEtBQXlCLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUN6QjtRQUNmLElBQUksQ0FBQyxJQUFJLE1BQU0sSUFBSSxNQUFNLG9DQUFvQztRQUM3RCxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVTtZQUFDO1NBQUc7SUFDdkM7SUFFQSxZQUNFLE9BQWUsRUFDZixJQUF3QixFQUN4QixPQUE0QixFQUNQO1FBQ3JCLE1BQU0sVUFBVTtRQUNoQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQztZQUNyQixNQUFNO1lBQ04sTUFBTSxRQUFRO1lBQ2Q7WUFDQSxtQkFBbUIsU0FBUztRQUM5QjtRQUNBLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssR0FBRztZQUNsQyxJQUFJLENBQUMsbUJBQW1CO1FBQzFCLENBQUM7UUFDRCxPQUFPO0lBQ1Q7SUFFQTs7R0FFQyxHQUNELE1BQU0sVUFBeUI7UUFDN0IsTUFBTSxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUM7SUFDdEI7SUFFQSxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQWtCLEVBQUU7UUFDakMsSUFBSTtZQUNGLE1BQU0sV0FBZ0M7Z0JBQ3BDLFVBQVUsSUFBSSxDQUFDLFFBQVE7Z0JBQ3ZCLE1BQU0sY0FBYyxJQUFJLENBQUMsSUFBSTtZQUMvQjtZQUNBLE1BQU0sT0FBa0IsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUNsQyxNQUFNLEtBQUssVUFBVSxDQUFDLFlBQ3RCLE1BQU0sS0FBSyxPQUFPLENBQUMsU0FBUztZQUVoQyxJQUFJLENBQUMsTUFBTSxHQUFHO1lBQ2QsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLFVBQVU7WUFDNUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLFVBQVU7WUFDNUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLO1lBQ3RCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSTtZQUV4QixJQUFJO2dCQUNGLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO29CQUNqQyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRO2dCQUN0RSxDQUFDO2dCQUNELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUU7b0JBQ25CLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3JDLENBQUM7WUFDSCxFQUFFLE9BQU8sT0FBTztnQkFDZCxJQUFJLENBQUMsS0FBSztnQkFDVixNQUFNLE1BQU07WUFDZDtZQUVBLElBQUksQ0FBQyxDQUFDLHlCQUF5QjtRQUNqQyxFQUFFLE9BQU8sT0FBTztZQUNkLElBQUksaUJBQWlCLHFCQUFxQjtnQkFDeEMsTUFBTyxNQUFNLEtBQUssSUFBSSxNQUFPO1lBQy9CLENBQUM7WUFFRCxNQUFNLFVBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUM3QjtZQUNBLElBQUksY0FBYyxJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUNwQyxNQUFNLE1BQU07WUFDZCxDQUFDO1lBQ0QsTUFBTSxNQUFNO1lBQ1osTUFBTSxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDdEI7SUFDRjtJQUVBLFFBQVE7UUFDTixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUk7UUFDckIsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLO1FBQ3pCLElBQUk7WUFDRixJQUFJLENBQUMsTUFBTSxDQUFFLEtBQUs7UUFDcEIsRUFBRSxPQUFPLE9BQU87WUFDZCxJQUFJLENBQUMsQ0FBQyxpQkFBaUIsS0FBSyxNQUFNLENBQUMsV0FBVyxHQUFHLE1BQU0sTUFBTTtRQUMvRDtJQUNGO0lBRUEsTUFBTSxZQUEyQjtRQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSTtZQUN4QixNQUFNLElBQUksTUFBTSxxQkFBcUI7UUFDdkMsQ0FBQztRQUNELElBQUk7WUFDRixNQUFNLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDdkIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJO1FBQzFCLEVBQUUsT0FBTyxRQUFRO1lBQ2YsSUFBSSxDQUFDLEtBQUs7WUFDVixNQUFNLElBQUksQ0FBQyxPQUFPO1lBQ2xCLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUN6QjtJQUNGO0lBRUEsTUFBYyxzQkFBc0I7UUFDbEMsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWTtRQUNuQyxJQUFJLENBQUMsU0FBUztRQUVkLElBQUk7WUFDRixNQUFNLFFBQVEsTUFBTSxZQUNsQixJQUFJLENBQUMsTUFBTSxFQUNYLElBQUksQ0FBQyxNQUFNLEVBQ1gsUUFBUSxJQUFJLEVBQ1osUUFBUSxJQUFJLEVBQ1osUUFBUSxpQkFBaUI7WUFFM0IsUUFBUSxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQzFCLEVBQUUsT0FBTyxPQUFPO1lBQ2QsSUFDRSxDQUFDLGlCQUFpQixVQUNsQixJQUFJLENBQUMsc0JBQXNCLElBQzNCO2dCQUNBLE9BQU8sUUFBUSxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQ2hDLENBQUM7WUFFRCxJQUFLLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFLO2dCQUMzQyx1REFBdUQ7Z0JBQ3ZELElBQUksQ0FBQyxLQUFLO2dCQUNWLElBQUk7b0JBQ0YsTUFBTSxJQUFJLENBQUMsT0FBTztvQkFFbEIsTUFBTSxRQUFRLE1BQU0sWUFDbEIsSUFBSSxDQUFDLE1BQU0sRUFDWCxJQUFJLENBQUMsTUFBTSxFQUNYLFFBQVEsSUFBSSxFQUNaLFFBQVEsSUFBSSxFQUNaLFFBQVEsaUJBQWlCO29CQUczQixPQUFPLFFBQVEsT0FBTyxDQUFDLE9BQU8sQ0FBQztnQkFDakMsRUFBRSxPQUFNO29CQUNOLE1BQU0sVUFBVSxJQUFJLENBQUMsT0FBTyxDQUFDO29CQUM3QixNQUFNLE1BQU07Z0JBQ2Q7WUFDRjtZQUVBLFFBQVEsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUN6QixTQUFVO1lBQ1IsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLO1lBQ3ZCLElBQUksQ0FBQyxtQkFBbUI7UUFDMUI7SUFDRjtJQUVRLHlCQUFrQztRQUN4QyxPQUFPLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWTtJQUM3QztJQUVBLENBQUMseUJBQXlCLEdBQUc7UUFDM0IsTUFBTSxFQUFFLG9CQUFtQixFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU87UUFDNUMsSUFBSSx1QkFBdUIsSUFBSSxFQUFFO1lBQy9CO1FBQ0YsQ0FBQztRQUVELE1BQU0sT0FBTyxVQUFZO1lBQ3ZCLElBQUksSUFBSSxDQUFDLHNCQUFzQixJQUFJO2dCQUNqQztZQUNGLENBQUM7WUFFRCxJQUFJO2dCQUNGLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJO1lBQzFCLEVBQUUsT0FBTTtnQkFDTixvQ0FBb0M7Z0JBQ3BDLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSztZQUMzQixTQUFVO2dCQUNSLFdBQVcsTUFBTTtZQUNuQjtRQUNGO1FBRUEsV0FBVyxNQUFNO0lBQ25CO0lBaE5VO0FBaU5aLENBQUM7QUFFRCxNQUFNLDRCQUE0QjtBQUFPO0FBRXpDLFNBQVMsY0FBYyxJQUFpQyxFQUFVO0lBQ2hFLElBQUk7SUFDSixJQUFJLE9BQU8sU0FBUyxVQUFVO1FBQzVCLGFBQWEsU0FBUztJQUN4QixPQUFPLElBQUksT0FBTyxTQUFTLFVBQVU7UUFDbkMsYUFBYTtJQUNmLE9BQU87UUFDTCxhQUFhO0lBQ2YsQ0FBQztJQUNELElBQUksQ0FBQyxPQUFPLGFBQWEsQ0FBQyxhQUFhO1FBQ3JDLE1BQU0sSUFBSSxNQUFNLG1CQUFtQjtJQUNyQyxDQUFDO0lBQ0QsT0FBTztBQUNUIn0=