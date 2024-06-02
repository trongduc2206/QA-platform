import { RedisConnection } from "./connection.ts";
import { DefaultExecutor } from "./executor.ts";
import { createRedisPipeline } from "./pipeline.ts";
import { psubscribe, subscribe } from "./pubsub.ts";
import { convertMap, isCondArray, isNumber, isString, parseXGroupDetail, parseXId, parseXMessage, parseXPendingConsumers, parseXPendingCounts, parseXReadReply, rawnum, rawstr, xidstr } from "./stream.ts";
const binaryCommandOptions = {
    returnUint8Arrays: true
};
class RedisImpl {
    executor;
    get isClosed() {
        return this.executor.connection.isClosed;
    }
    get isConnected() {
        return this.executor.connection.isConnected;
    }
    constructor(executor){
        this.executor = executor;
    }
    sendCommand(command, args, options) {
        return this.executor.sendCommand(command, args, options);
    }
    connect() {
        return this.executor.connection.connect();
    }
    close() {
        this.executor.close();
    }
    async execReply(command, ...args) {
        const reply = await this.executor.exec(command, ...args);
        return reply;
    }
    async execStatusReply(command, ...args) {
        const reply = await this.executor.exec(command, ...args);
        return reply;
    }
    async execIntegerReply(command, ...args) {
        const reply = await this.executor.exec(command, ...args);
        return reply;
    }
    async execBinaryReply(command, ...args) {
        const reply = await this.executor.sendCommand(command, args, binaryCommandOptions);
        return reply;
    }
    async execBulkReply(command, ...args) {
        const reply = await this.executor.exec(command, ...args);
        return reply;
    }
    async execArrayReply(command, ...args) {
        const reply = await this.executor.exec(command, ...args);
        return reply;
    }
    async execIntegerOrNilReply(command, ...args) {
        const reply = await this.executor.exec(command, ...args);
        return reply;
    }
    async execStatusOrNilReply(command, ...args) {
        const reply = await this.executor.exec(command, ...args);
        return reply;
    }
    aclCat(categoryname) {
        if (categoryname !== undefined) {
            return this.execArrayReply("ACL", "CAT", categoryname);
        }
        return this.execArrayReply("ACL", "CAT");
    }
    aclDelUser(...usernames) {
        return this.execIntegerReply("ACL", "DELUSER", ...usernames);
    }
    aclGenPass(bits) {
        if (bits !== undefined) {
            return this.execBulkReply("ACL", "GENPASS", bits);
        }
        return this.execBulkReply("ACL", "GENPASS");
    }
    aclGetUser(username) {
        return this.execArrayReply("ACL", "GETUSER", username);
    }
    aclHelp() {
        return this.execArrayReply("ACL", "HELP");
    }
    aclList() {
        return this.execArrayReply("ACL", "LIST");
    }
    aclLoad() {
        return this.execStatusReply("ACL", "LOAD");
    }
    aclLog(param) {
        if (param === "RESET") {
            return this.execStatusReply("ACL", "LOG", "RESET");
        }
        return this.execArrayReply("ACL", "LOG", param);
    }
    aclSave() {
        return this.execStatusReply("ACL", "SAVE");
    }
    aclSetUser(username, ...rules) {
        return this.execStatusReply("ACL", "SETUSER", username, ...rules);
    }
    aclUsers() {
        return this.execArrayReply("ACL", "USERS");
    }
    aclWhoami() {
        return this.execBulkReply("ACL", "WHOAMI");
    }
    append(key, value) {
        return this.execIntegerReply("APPEND", key, value);
    }
    auth(param1, param2) {
        if (param2 !== undefined) {
            return this.execStatusReply("AUTH", param1, param2);
        }
        return this.execStatusReply("AUTH", param1);
    }
    bgrewriteaof() {
        return this.execStatusReply("BGREWRITEAOF");
    }
    bgsave() {
        return this.execStatusReply("BGSAVE");
    }
    bitcount(key, start, end) {
        if (start !== undefined && end !== undefined) {
            return this.execIntegerReply("BITCOUNT", key, start, end);
        }
        return this.execIntegerReply("BITCOUNT", key);
    }
    bitfield(key, opts) {
        const args = [
            key
        ];
        if (opts?.get) {
            const { type , offset  } = opts.get;
            args.push("GET", type, offset);
        }
        if (opts?.set) {
            const { type , offset , value  } = opts.set;
            args.push("SET", type, offset, value);
        }
        if (opts?.incrby) {
            const { type , offset , increment  } = opts.incrby;
            args.push("INCRBY", type, offset, increment);
        }
        if (opts?.overflow) {
            args.push("OVERFLOW", opts.overflow);
        }
        return this.execArrayReply("BITFIELD", ...args);
    }
    bitop(operation, destkey, ...keys) {
        return this.execIntegerReply("BITOP", operation, destkey, ...keys);
    }
    bitpos(key, bit, start, end) {
        if (start !== undefined && end !== undefined) {
            return this.execIntegerReply("BITPOS", key, bit, start, end);
        }
        if (start !== undefined) {
            return this.execIntegerReply("BITPOS", key, bit, start);
        }
        return this.execIntegerReply("BITPOS", key, bit);
    }
    blpop(timeout, ...keys) {
        return this.execArrayReply("BLPOP", ...keys, timeout);
    }
    brpop(timeout, ...keys) {
        return this.execArrayReply("BRPOP", ...keys, timeout);
    }
    brpoplpush(source, destination, timeout) {
        return this.execBulkReply("BRPOPLPUSH", source, destination, timeout);
    }
    bzpopmin(timeout, ...keys) {
        return this.execArrayReply("BZPOPMIN", ...keys, timeout);
    }
    bzpopmax(timeout, ...keys) {
        return this.execArrayReply("BZPOPMAX", ...keys, timeout);
    }
    clientCaching(mode) {
        return this.execStatusReply("CLIENT", "CACHING", mode);
    }
    clientGetName() {
        return this.execBulkReply("CLIENT", "GETNAME");
    }
    clientGetRedir() {
        return this.execIntegerReply("CLIENT", "GETREDIR");
    }
    clientID() {
        return this.execIntegerReply("CLIENT", "ID");
    }
    clientInfo() {
        return this.execBulkReply("CLIENT", "INFO");
    }
    clientKill(opts) {
        const args = [];
        if (opts.addr) {
            args.push("ADDR", opts.addr);
        }
        if (opts.laddr) {
            args.push("LADDR", opts.laddr);
        }
        if (opts.id) {
            args.push("ID", opts.id);
        }
        if (opts.type) {
            args.push("TYPE", opts.type);
        }
        if (opts.user) {
            args.push("USER", opts.user);
        }
        if (opts.skipme) {
            args.push("SKIPME", opts.skipme);
        }
        return this.execIntegerReply("CLIENT", "KILL", ...args);
    }
    clientList(opts) {
        if (opts && opts.type && opts.ids) {
            throw new Error("only one of `type` or `ids` can be specified");
        }
        if (opts && opts.type) {
            return this.execBulkReply("CLIENT", "LIST", "TYPE", opts.type);
        }
        if (opts && opts.ids) {
            return this.execBulkReply("CLIENT", "LIST", "ID", ...opts.ids);
        }
        return this.execBulkReply("CLIENT", "LIST");
    }
    clientPause(timeout, mode) {
        if (mode) {
            return this.execStatusReply("CLIENT", "PAUSE", timeout, mode);
        }
        return this.execStatusReply("CLIENT", "PAUSE", timeout);
    }
    clientSetName(connectionName) {
        return this.execStatusReply("CLIENT", "SETNAME", connectionName);
    }
    clientTracking(opts) {
        const args = [
            opts.mode
        ];
        if (opts.redirect) {
            args.push("REDIRECT", opts.redirect);
        }
        if (opts.prefixes) {
            opts.prefixes.forEach((prefix)=>{
                args.push("PREFIX");
                args.push(prefix);
            });
        }
        if (opts.bcast) {
            args.push("BCAST");
        }
        if (opts.optIn) {
            args.push("OPTIN");
        }
        if (opts.optOut) {
            args.push("OPTOUT");
        }
        if (opts.noLoop) {
            args.push("NOLOOP");
        }
        return this.execStatusReply("CLIENT", "TRACKING", ...args);
    }
    clientTrackingInfo() {
        return this.execArrayReply("CLIENT", "TRACKINGINFO");
    }
    clientUnblock(id, behaviour) {
        if (behaviour) {
            return this.execIntegerReply("CLIENT", "UNBLOCK", id, behaviour);
        }
        return this.execIntegerReply("CLIENT", "UNBLOCK", id);
    }
    clientUnpause() {
        return this.execStatusReply("CLIENT", "UNPAUSE");
    }
    asking() {
        return this.execStatusReply("ASKING");
    }
    clusterAddSlots(...slots) {
        return this.execStatusReply("CLUSTER", "ADDSLOTS", ...slots);
    }
    clusterCountFailureReports(nodeId) {
        return this.execIntegerReply("CLUSTER", "COUNT-FAILURE-REPORTS", nodeId);
    }
    clusterCountKeysInSlot(slot) {
        return this.execIntegerReply("CLUSTER", "COUNTKEYSINSLOT", slot);
    }
    clusterDelSlots(...slots) {
        return this.execStatusReply("CLUSTER", "DELSLOTS", ...slots);
    }
    clusterFailover(mode) {
        if (mode) {
            return this.execStatusReply("CLUSTER", "FAILOVER", mode);
        }
        return this.execStatusReply("CLUSTER", "FAILOVER");
    }
    clusterFlushSlots() {
        return this.execStatusReply("CLUSTER", "FLUSHSLOTS");
    }
    clusterForget(nodeId) {
        return this.execStatusReply("CLUSTER", "FORGET", nodeId);
    }
    clusterGetKeysInSlot(slot, count) {
        return this.execArrayReply("CLUSTER", "GETKEYSINSLOT", slot, count);
    }
    clusterInfo() {
        return this.execStatusReply("CLUSTER", "INFO");
    }
    clusterKeySlot(key) {
        return this.execIntegerReply("CLUSTER", "KEYSLOT", key);
    }
    clusterMeet(ip, port) {
        return this.execStatusReply("CLUSTER", "MEET", ip, port);
    }
    clusterMyID() {
        return this.execStatusReply("CLUSTER", "MYID");
    }
    clusterNodes() {
        return this.execBulkReply("CLUSTER", "NODES");
    }
    clusterReplicas(nodeId) {
        return this.execArrayReply("CLUSTER", "REPLICAS", nodeId);
    }
    clusterReplicate(nodeId) {
        return this.execStatusReply("CLUSTER", "REPLICATE", nodeId);
    }
    clusterReset(mode) {
        if (mode) {
            return this.execStatusReply("CLUSTER", "RESET", mode);
        }
        return this.execStatusReply("CLUSTER", "RESET");
    }
    clusterSaveConfig() {
        return this.execStatusReply("CLUSTER", "SAVECONFIG");
    }
    clusterSetSlot(slot, subcommand, nodeId) {
        if (nodeId !== undefined) {
            return this.execStatusReply("CLUSTER", "SETSLOT", slot, subcommand, nodeId);
        }
        return this.execStatusReply("CLUSTER", "SETSLOT", slot, subcommand);
    }
    clusterSlaves(nodeId) {
        return this.execArrayReply("CLUSTER", "SLAVES", nodeId);
    }
    clusterSlots() {
        return this.execArrayReply("CLUSTER", "SLOTS");
    }
    command() {
        return this.execArrayReply("COMMAND");
    }
    commandCount() {
        return this.execIntegerReply("COMMAND", "COUNT");
    }
    commandGetKeys() {
        return this.execArrayReply("COMMAND", "GETKEYS");
    }
    commandInfo(...commandNames) {
        return this.execArrayReply("COMMAND", "INFO", ...commandNames);
    }
    configGet(parameter) {
        return this.execArrayReply("CONFIG", "GET", parameter);
    }
    configResetStat() {
        return this.execStatusReply("CONFIG", "RESETSTAT");
    }
    configRewrite() {
        return this.execStatusReply("CONFIG", "REWRITE");
    }
    configSet(parameter, value) {
        return this.execStatusReply("CONFIG", "SET", parameter, value);
    }
    dbsize() {
        return this.execIntegerReply("DBSIZE");
    }
    debugObject(key) {
        return this.execStatusReply("DEBUG", "OBJECT", key);
    }
    debugSegfault() {
        return this.execStatusReply("DEBUG", "SEGFAULT");
    }
    decr(key) {
        return this.execIntegerReply("DECR", key);
    }
    decrby(key, decrement) {
        return this.execIntegerReply("DECRBY", key, decrement);
    }
    del(...keys) {
        return this.execIntegerReply("DEL", ...keys);
    }
    discard() {
        return this.execStatusReply("DISCARD");
    }
    dump(key) {
        return this.execBinaryReply("DUMP", key);
    }
    echo(message) {
        return this.execBulkReply("ECHO", message);
    }
    eval(script, keys, args) {
        return this.execReply("EVAL", script, keys.length, ...keys, ...args);
    }
    evalsha(sha1, keys, args) {
        return this.execReply("EVALSHA", sha1, keys.length, ...keys, ...args);
    }
    exec() {
        return this.execArrayReply("EXEC");
    }
    exists(...keys) {
        return this.execIntegerReply("EXISTS", ...keys);
    }
    expire(key, seconds) {
        return this.execIntegerReply("EXPIRE", key, seconds);
    }
    expireat(key, timestamp) {
        return this.execIntegerReply("EXPIREAT", key, timestamp);
    }
    flushall(async) {
        if (async) {
            return this.execStatusReply("FLUSHALL", "ASYNC");
        }
        return this.execStatusReply("FLUSHALL");
    }
    flushdb(async) {
        if (async) {
            return this.execStatusReply("FLUSHDB", "ASYNC");
        }
        return this.execStatusReply("FLUSHDB");
    }
    // deno-lint-ignore no-explicit-any
    geoadd(key, ...params) {
        const args = [
            key
        ];
        if (Array.isArray(params[0])) {
            args.push(...params.flatMap((e)=>e));
        } else if (typeof params[0] === "object") {
            for (const [member, lnglat] of Object.entries(params[0])){
                args.push(...lnglat, member);
            }
        } else {
            args.push(...params);
        }
        return this.execIntegerReply("GEOADD", ...args);
    }
    geohash(key, ...members) {
        return this.execArrayReply("GEOHASH", key, ...members);
    }
    geopos(key, ...members) {
        return this.execArrayReply("GEOPOS", key, ...members);
    }
    geodist(key, member1, member2, unit) {
        if (unit) {
            return this.execBulkReply("GEODIST", key, member1, member2, unit);
        }
        return this.execBulkReply("GEODIST", key, member1, member2);
    }
    georadius(key, longitude, latitude, radius, unit, opts) {
        const args = this.pushGeoRadiusOpts([
            key,
            longitude,
            latitude,
            radius,
            unit
        ], opts);
        return this.execArrayReply("GEORADIUS", ...args);
    }
    georadiusbymember(key, member, radius, unit, opts) {
        const args = this.pushGeoRadiusOpts([
            key,
            member,
            radius,
            unit
        ], opts);
        return this.execArrayReply("GEORADIUSBYMEMBER", ...args);
    }
    pushGeoRadiusOpts(args, opts) {
        if (opts?.withCoord) {
            args.push("WITHCOORD");
        }
        if (opts?.withDist) {
            args.push("WITHDIST");
        }
        if (opts?.withHash) {
            args.push("WITHHASH");
        }
        if (opts?.count !== undefined) {
            args.push(opts.count);
        }
        if (opts?.sort) {
            args.push(opts.sort);
        }
        if (opts?.store !== undefined) {
            args.push(opts.store);
        }
        if (opts?.storeDist !== undefined) {
            args.push(opts.storeDist);
        }
        return args;
    }
    get(key) {
        return this.execBulkReply("GET", key);
    }
    getbit(key, offset) {
        return this.execIntegerReply("GETBIT", key, offset);
    }
    getrange(key, start, end) {
        return this.execBulkReply("GETRANGE", key, start, end);
    }
    getset(key, value) {
        return this.execBulkReply("GETSET", key, value);
    }
    hdel(key, ...fields) {
        return this.execIntegerReply("HDEL", key, ...fields);
    }
    hexists(key, field) {
        return this.execIntegerReply("HEXISTS", key, field);
    }
    hget(key, field) {
        return this.execBulkReply("HGET", key, field);
    }
    hgetall(key) {
        return this.execArrayReply("HGETALL", key);
    }
    hincrby(key, field, increment) {
        return this.execIntegerReply("HINCRBY", key, field, increment);
    }
    hincrbyfloat(key, field, increment) {
        return this.execBulkReply("HINCRBYFLOAT", key, field, increment);
    }
    hkeys(key) {
        return this.execArrayReply("HKEYS", key);
    }
    hlen(key) {
        return this.execIntegerReply("HLEN", key);
    }
    hmget(key, ...fields) {
        return this.execArrayReply("HMGET", key, ...fields);
    }
    // deno-lint-ignore no-explicit-any
    hmset(key, ...params) {
        const args = [
            key
        ];
        if (Array.isArray(params[0])) {
            args.push(...params.flatMap((e)=>e));
        } else if (typeof params[0] === "object") {
            for (const [field, value] of Object.entries(params[0])){
                args.push(field, value);
            }
        } else {
            args.push(...params);
        }
        return this.execStatusReply("HMSET", ...args);
    }
    // deno-lint-ignore no-explicit-any
    hset(key, ...params) {
        const args = [
            key
        ];
        if (Array.isArray(params[0])) {
            args.push(...params.flatMap((e)=>e));
        } else if (typeof params[0] === "object") {
            for (const [field, value] of Object.entries(params[0])){
                args.push(field, value);
            }
        } else {
            args.push(...params);
        }
        return this.execIntegerReply("HSET", ...args);
    }
    hsetnx(key, field, value) {
        return this.execIntegerReply("HSETNX", key, field, value);
    }
    hstrlen(key, field) {
        return this.execIntegerReply("HSTRLEN", key, field);
    }
    hvals(key) {
        return this.execArrayReply("HVALS", key);
    }
    incr(key) {
        return this.execIntegerReply("INCR", key);
    }
    incrby(key, increment) {
        return this.execIntegerReply("INCRBY", key, increment);
    }
    incrbyfloat(key, increment) {
        return this.execBulkReply("INCRBYFLOAT", key, increment);
    }
    info(section) {
        if (section !== undefined) {
            return this.execStatusReply("INFO", section);
        }
        return this.execStatusReply("INFO");
    }
    keys(pattern) {
        return this.execArrayReply("KEYS", pattern);
    }
    lastsave() {
        return this.execIntegerReply("LASTSAVE");
    }
    lindex(key, index) {
        return this.execBulkReply("LINDEX", key, index);
    }
    linsert(key, loc, pivot, value) {
        return this.execIntegerReply("LINSERT", key, loc, pivot, value);
    }
    llen(key) {
        return this.execIntegerReply("LLEN", key);
    }
    lpop(key) {
        return this.execBulkReply("LPOP", key);
    }
    lpos(key, element, opts) {
        const args = [
            element
        ];
        if (opts?.rank != null) {
            args.push("RANK", String(opts.rank));
        }
        if (opts?.count != null) {
            args.push("COUNT", String(opts.count));
        }
        if (opts?.maxlen != null) {
            args.push("MAXLEN", String(opts.maxlen));
        }
        return opts?.count == null ? this.execIntegerReply("LPOS", key, ...args) : this.execArrayReply("LPOS", key, ...args);
    }
    lpush(key, ...elements) {
        return this.execIntegerReply("LPUSH", key, ...elements);
    }
    lpushx(key, ...elements) {
        return this.execIntegerReply("LPUSHX", key, ...elements);
    }
    lrange(key, start, stop) {
        return this.execArrayReply("LRANGE", key, start, stop);
    }
    lrem(key, count, element) {
        return this.execIntegerReply("LREM", key, count, element);
    }
    lset(key, index, element) {
        return this.execStatusReply("LSET", key, index, element);
    }
    ltrim(key, start, stop) {
        return this.execStatusReply("LTRIM", key, start, stop);
    }
    memoryDoctor() {
        return this.execBulkReply("MEMORY", "DOCTOR");
    }
    memoryHelp() {
        return this.execArrayReply("MEMORY", "HELP");
    }
    memoryMallocStats() {
        return this.execBulkReply("MEMORY", "MALLOC", "STATS");
    }
    memoryPurge() {
        return this.execStatusReply("MEMORY", "PURGE");
    }
    memoryStats() {
        return this.execArrayReply("MEMORY", "STATS");
    }
    memoryUsage(key, opts) {
        const args = [
            key
        ];
        if (opts?.samples !== undefined) {
            args.push("SAMPLES", opts.samples);
        }
        return this.execIntegerReply("MEMORY", "USAGE", ...args);
    }
    mget(...keys) {
        return this.execArrayReply("MGET", ...keys);
    }
    migrate(host, port, key, destinationDB, timeout, opts) {
        const args = [
            host,
            port,
            key,
            destinationDB,
            timeout
        ];
        if (opts?.copy) {
            args.push("COPY");
        }
        if (opts?.replace) {
            args.push("REPLACE");
        }
        if (opts?.auth !== undefined) {
            args.push("AUTH", opts.auth);
        }
        if (opts?.keys) {
            args.push("KEYS", ...opts.keys);
        }
        return this.execStatusReply("MIGRATE", ...args);
    }
    moduleList() {
        return this.execArrayReply("MODULE", "LIST");
    }
    moduleLoad(path, ...args) {
        return this.execStatusReply("MODULE", "LOAD", path, ...args);
    }
    moduleUnload(name) {
        return this.execStatusReply("MODULE", "UNLOAD", name);
    }
    monitor() {
        throw new Error("not supported yet");
    }
    move(key, db) {
        return this.execIntegerReply("MOVE", key, db);
    }
    // deno-lint-ignore no-explicit-any
    mset(...params) {
        const args = [];
        if (Array.isArray(params[0])) {
            args.push(...params.flatMap((e)=>e));
        } else if (typeof params[0] === "object") {
            for (const [key, value] of Object.entries(params[0])){
                args.push(key, value);
            }
        } else {
            args.push(...params);
        }
        return this.execStatusReply("MSET", ...args);
    }
    // deno-lint-ignore no-explicit-any
    msetnx(...params) {
        const args = [];
        if (Array.isArray(params[0])) {
            args.push(...params.flatMap((e)=>e));
        } else if (typeof params[0] === "object") {
            for (const [key, value] of Object.entries(params[0])){
                args.push(key, value);
            }
        } else {
            args.push(...params);
        }
        return this.execIntegerReply("MSETNX", ...args);
    }
    multi() {
        return this.execStatusReply("MULTI");
    }
    objectEncoding(key) {
        return this.execBulkReply("OBJECT", "ENCODING", key);
    }
    objectFreq(key) {
        return this.execIntegerOrNilReply("OBJECT", "FREQ", key);
    }
    objectHelp() {
        return this.execArrayReply("OBJECT", "HELP");
    }
    objectIdletime(key) {
        return this.execIntegerOrNilReply("OBJECT", "IDLETIME", key);
    }
    objectRefCount(key) {
        return this.execIntegerOrNilReply("OBJECT", "REFCOUNT", key);
    }
    persist(key) {
        return this.execIntegerReply("PERSIST", key);
    }
    pexpire(key, milliseconds) {
        return this.execIntegerReply("PEXPIRE", key, milliseconds);
    }
    pexpireat(key, millisecondsTimestamp) {
        return this.execIntegerReply("PEXPIREAT", key, millisecondsTimestamp);
    }
    pfadd(key, ...elements) {
        return this.execIntegerReply("PFADD", key, ...elements);
    }
    pfcount(...keys) {
        return this.execIntegerReply("PFCOUNT", ...keys);
    }
    pfmerge(destkey, ...sourcekeys) {
        return this.execStatusReply("PFMERGE", destkey, ...sourcekeys);
    }
    ping(message) {
        if (message) {
            return this.execBulkReply("PING", message);
        }
        return this.execStatusReply("PING");
    }
    psetex(key, milliseconds, value) {
        return this.execStatusReply("PSETEX", key, milliseconds, value);
    }
    publish(channel, message) {
        return this.execIntegerReply("PUBLISH", channel, message);
    }
    subscribe(...channels) {
        return subscribe(this.executor, ...channels);
    }
    psubscribe(...patterns) {
        return psubscribe(this.executor, ...patterns);
    }
    pubsubChannels(pattern) {
        if (pattern !== undefined) {
            return this.execArrayReply("PUBSUB", "CHANNELS", pattern);
        }
        return this.execArrayReply("PUBSUB", "CHANNELS");
    }
    pubsubNumpat() {
        return this.execIntegerReply("PUBSUB", "NUMPAT");
    }
    pubsubNumsub(...channels) {
        return this.execArrayReply("PUBSUB", "NUMSUB", ...channels);
    }
    pttl(key) {
        return this.execIntegerReply("PTTL", key);
    }
    quit() {
        return this.execStatusReply("QUIT").finally(()=>this.close());
    }
    randomkey() {
        return this.execBulkReply("RANDOMKEY");
    }
    readonly() {
        return this.execStatusReply("READONLY");
    }
    readwrite() {
        return this.execStatusReply("READWRITE");
    }
    rename(key, newkey) {
        return this.execStatusReply("RENAME", key, newkey);
    }
    renamenx(key, newkey) {
        return this.execIntegerReply("RENAMENX", key, newkey);
    }
    restore(key, ttl, serializedValue, opts) {
        const args = [
            key,
            ttl,
            serializedValue
        ];
        if (opts?.replace) {
            args.push("REPLACE");
        }
        if (opts?.absttl) {
            args.push("ABSTTL");
        }
        if (opts?.idletime !== undefined) {
            args.push("IDLETIME", opts.idletime);
        }
        if (opts?.freq !== undefined) {
            args.push("FREQ", opts.freq);
        }
        return this.execStatusReply("RESTORE", ...args);
    }
    role() {
        return this.execArrayReply("ROLE");
    }
    rpop(key) {
        return this.execBulkReply("RPOP", key);
    }
    rpoplpush(source, destination) {
        return this.execBulkReply("RPOPLPUSH", source, destination);
    }
    rpush(key, ...elements) {
        return this.execIntegerReply("RPUSH", key, ...elements);
    }
    rpushx(key, ...elements) {
        return this.execIntegerReply("RPUSHX", key, ...elements);
    }
    sadd(key, ...members) {
        return this.execIntegerReply("SADD", key, ...members);
    }
    save() {
        return this.execStatusReply("SAVE");
    }
    scard(key) {
        return this.execIntegerReply("SCARD", key);
    }
    scriptDebug(mode) {
        return this.execStatusReply("SCRIPT", "DEBUG", mode);
    }
    scriptExists(...sha1s) {
        return this.execArrayReply("SCRIPT", "EXISTS", ...sha1s);
    }
    scriptFlush() {
        return this.execStatusReply("SCRIPT", "FLUSH");
    }
    scriptKill() {
        return this.execStatusReply("SCRIPT", "KILL");
    }
    scriptLoad(script) {
        return this.execStatusReply("SCRIPT", "LOAD", script);
    }
    sdiff(...keys) {
        return this.execArrayReply("SDIFF", ...keys);
    }
    sdiffstore(destination, ...keys) {
        return this.execIntegerReply("SDIFFSTORE", destination, ...keys);
    }
    select(index) {
        return this.execStatusReply("SELECT", index);
    }
    set(key, value, opts) {
        const args = [
            key,
            value
        ];
        if (opts?.ex !== undefined) {
            args.push("EX", opts.ex);
        } else if (opts?.px !== undefined) {
            args.push("PX", opts.px);
        }
        if (opts?.keepttl) {
            args.push("KEEPTTL");
        }
        if (opts?.mode) {
            args.push(opts.mode);
            return this.execStatusOrNilReply("SET", ...args);
        }
        return this.execStatusReply("SET", ...args);
    }
    setbit(key, offset, value) {
        return this.execIntegerReply("SETBIT", key, offset, value);
    }
    setex(key, seconds, value) {
        return this.execStatusReply("SETEX", key, seconds, value);
    }
    setnx(key, value) {
        return this.execIntegerReply("SETNX", key, value);
    }
    setrange(key, offset, value) {
        return this.execIntegerReply("SETRANGE", key, offset, value);
    }
    shutdown(mode) {
        if (mode) {
            return this.execStatusReply("SHUTDOWN", mode);
        }
        return this.execStatusReply("SHUTDOWN");
    }
    sinter(...keys) {
        return this.execArrayReply("SINTER", ...keys);
    }
    sinterstore(destination, ...keys) {
        return this.execIntegerReply("SINTERSTORE", destination, ...keys);
    }
    sismember(key, member) {
        return this.execIntegerReply("SISMEMBER", key, member);
    }
    slaveof(host, port) {
        return this.execStatusReply("SLAVEOF", host, port);
    }
    slaveofNoOne() {
        return this.execStatusReply("SLAVEOF", "NO ONE");
    }
    replicaof(host, port) {
        return this.execStatusReply("REPLICAOF", host, port);
    }
    replicaofNoOne() {
        return this.execStatusReply("REPLICAOF", "NO ONE");
    }
    slowlog(subcommand, ...args) {
        return this.execArrayReply("SLOWLOG", subcommand, ...args);
    }
    smembers(key) {
        return this.execArrayReply("SMEMBERS", key);
    }
    smove(source, destination, member) {
        return this.execIntegerReply("SMOVE", source, destination, member);
    }
    sort(key, opts) {
        const args = [
            key
        ];
        if (opts?.by !== undefined) {
            args.push("BY", opts.by);
        }
        if (opts?.limit) {
            args.push("LIMIT", opts.limit.offset, opts.limit.count);
        }
        if (opts?.patterns) {
            args.push(...opts.patterns.flatMap((pattern)=>[
                    "GET",
                    pattern
                ]));
        }
        if (opts?.order) {
            args.push(opts.order);
        }
        if (opts?.alpha) {
            args.push("ALPHA");
        }
        if (opts?.destination !== undefined) {
            args.push("STORE", opts.destination);
            return this.execIntegerReply("SORT", ...args);
        }
        return this.execArrayReply("SORT", ...args);
    }
    spop(key, count) {
        if (count !== undefined) {
            return this.execArrayReply("SPOP", key, count);
        }
        return this.execBulkReply("SPOP", key);
    }
    srandmember(key, count) {
        if (count !== undefined) {
            return this.execArrayReply("SRANDMEMBER", key, count);
        }
        return this.execBulkReply("SRANDMEMBER", key);
    }
    srem(key, ...members) {
        return this.execIntegerReply("SREM", key, ...members);
    }
    stralgo(algorithm, target, a, b, opts) {
        const args = [];
        if (opts?.idx) {
            args.push("IDX");
        }
        if (opts?.len) {
            args.push("LEN");
        }
        if (opts?.withmatchlen) {
            args.push("WITHMATCHLEN");
        }
        if (opts?.minmatchlen) {
            args.push("MINMATCHLEN");
            args.push(opts.minmatchlen);
        }
        return this.execReply("STRALGO", algorithm, target, a, b, ...args);
    }
    strlen(key) {
        return this.execIntegerReply("STRLEN", key);
    }
    sunion(...keys) {
        return this.execArrayReply("SUNION", ...keys);
    }
    sunionstore(destination, ...keys) {
        return this.execIntegerReply("SUNIONSTORE", destination, ...keys);
    }
    swapdb(index1, index2) {
        return this.execStatusReply("SWAPDB", index1, index2);
    }
    sync() {
        throw new Error("not implemented");
    }
    time() {
        return this.execArrayReply("TIME");
    }
    touch(...keys) {
        return this.execIntegerReply("TOUCH", ...keys);
    }
    ttl(key) {
        return this.execIntegerReply("TTL", key);
    }
    type(key) {
        return this.execStatusReply("TYPE", key);
    }
    unlink(...keys) {
        return this.execIntegerReply("UNLINK", ...keys);
    }
    unwatch() {
        return this.execStatusReply("UNWATCH");
    }
    wait(numreplicas, timeout) {
        return this.execIntegerReply("WAIT", numreplicas, timeout);
    }
    watch(...keys) {
        return this.execStatusReply("WATCH", ...keys);
    }
    xack(key, group, ...xids) {
        return this.execIntegerReply("XACK", key, group, ...xids.map((xid)=>xidstr(xid)));
    }
    xadd(key, xid, fieldValues, maxlen = undefined) {
        const args = [
            key
        ];
        if (maxlen) {
            args.push("MAXLEN");
            if (maxlen.approx) {
                args.push("~");
            }
            args.push(maxlen.elements.toString());
        }
        args.push(xidstr(xid));
        if (fieldValues instanceof Map) {
            for (const [f, v] of fieldValues){
                args.push(f);
                args.push(v);
            }
        } else {
            for (const [f, v] of Object.entries(fieldValues)){
                args.push(f);
                args.push(v);
            }
        }
        return this.execBulkReply("XADD", ...args).then((rawId)=>parseXId(rawId));
    }
    xclaim(key, opts, ...xids) {
        const args = [];
        if (opts.idle) {
            args.push("IDLE");
            args.push(opts.idle);
        }
        if (opts.time) {
            args.push("TIME");
            args.push(opts.time);
        }
        if (opts.retryCount) {
            args.push("RETRYCOUNT");
            args.push(opts.retryCount);
        }
        if (opts.force) {
            args.push("FORCE");
        }
        if (opts.justXId) {
            args.push("JUSTID");
        }
        return this.execArrayReply("XCLAIM", key, opts.group, opts.consumer, opts.minIdleTime, ...xids.map((xid)=>xidstr(xid)), ...args).then((raw)=>{
            if (opts.justXId) {
                const xids = [];
                for (const r of raw){
                    if (typeof r === "string") {
                        xids.push(parseXId(r));
                    }
                }
                const payload = {
                    kind: "justxid",
                    xids
                };
                return payload;
            }
            const messages = [];
            for (const r of raw){
                if (typeof r !== "string") {
                    messages.push(parseXMessage(r));
                }
            }
            const payload = {
                kind: "messages",
                messages
            };
            return payload;
        });
    }
    xdel(key, ...xids) {
        return this.execIntegerReply("XDEL", key, ...xids.map((rawId)=>xidstr(rawId)));
    }
    xlen(key) {
        return this.execIntegerReply("XLEN", key);
    }
    xgroupCreate(key, groupName, xid, mkstream) {
        const args = [];
        if (mkstream) {
            args.push("MKSTREAM");
        }
        return this.execStatusReply("XGROUP", "CREATE", key, groupName, xidstr(xid), ...args);
    }
    xgroupDelConsumer(key, groupName, consumerName) {
        return this.execIntegerReply("XGROUP", "DELCONSUMER", key, groupName, consumerName);
    }
    xgroupDestroy(key, groupName) {
        return this.execIntegerReply("XGROUP", "DESTROY", key, groupName);
    }
    xgroupHelp() {
        return this.execBulkReply("XGROUP", "HELP");
    }
    xgroupSetID(key, groupName, xid) {
        return this.execStatusReply("XGROUP", "SETID", key, groupName, xidstr(xid));
    }
    xinfoStream(key) {
        return this.execArrayReply("XINFO", "STREAM", key).then((raw)=>{
            // Note that you should not rely on the fields
            // exact position, nor on the number of fields,
            // new fields may be added in the future.
            const data = convertMap(raw);
            const firstEntry = parseXMessage(data.get("first-entry"));
            const lastEntry = parseXMessage(data.get("last-entry"));
            return {
                length: rawnum(data.get("length") ?? null),
                radixTreeKeys: rawnum(data.get("radix-tree-keys") ?? null),
                radixTreeNodes: rawnum(data.get("radix-tree-nodes") ?? null),
                groups: rawnum(data.get("groups") ?? null),
                lastGeneratedId: parseXId(rawstr(data.get("last-generated-id") ?? null)),
                firstEntry,
                lastEntry
            };
        });
    }
    xinfoStreamFull(key, count) {
        const args = [];
        if (count) {
            args.push("COUNT");
            args.push(count);
        }
        return this.execArrayReply("XINFO", "STREAM", key, "FULL", ...args).then((raw)=>{
            // Note that you should not rely on the fields
            // exact position, nor on the number of fields,
            // new fields may be added in the future.
            if (raw == null) throw "no data";
            const data = convertMap(raw);
            if (data === undefined) throw "no data converted";
            const entries = data.get("entries").map((raw)=>parseXMessage(raw));
            return {
                length: rawnum(data.get("length") ?? null),
                radixTreeKeys: rawnum(data.get("radix-tree-keys") ?? null),
                radixTreeNodes: rawnum(data.get("radix-tree-nodes") ?? null),
                lastGeneratedId: parseXId(rawstr(data.get("last-generated-id") ?? null)),
                entries,
                groups: parseXGroupDetail(data.get("groups"))
            };
        });
    }
    xinfoGroups(key) {
        return this.execArrayReply("XINFO", "GROUPS", key).then((raws)=>raws.map((raw)=>{
                const data = convertMap(raw);
                return {
                    name: rawstr(data.get("name") ?? null),
                    consumers: rawnum(data.get("consumers") ?? null),
                    pending: rawnum(data.get("pending") ?? null),
                    lastDeliveredId: parseXId(rawstr(data.get("last-delivered-id") ?? null))
                };
            }));
    }
    xinfoConsumers(key, group) {
        return this.execArrayReply("XINFO", "CONSUMERS", key, group).then((raws)=>raws.map((raw)=>{
                const data = convertMap(raw);
                return {
                    name: rawstr(data.get("name") ?? null),
                    pending: rawnum(data.get("pending") ?? null),
                    idle: rawnum(data.get("idle") ?? null)
                };
            }));
    }
    xpending(key, group) {
        return this.execArrayReply("XPENDING", key, group).then((raw)=>{
            if (isNumber(raw[0]) && isString(raw[1]) && isString(raw[2]) && isCondArray(raw[3])) {
                return {
                    count: raw[0],
                    startId: parseXId(raw[1]),
                    endId: parseXId(raw[2]),
                    consumers: parseXPendingConsumers(raw[3])
                };
            } else {
                throw "parse err";
            }
        });
    }
    xpendingCount(key, group, startEndCount, consumer) {
        const args = [];
        args.push(startEndCount.start);
        args.push(startEndCount.end);
        args.push(startEndCount.count);
        if (consumer) {
            args.push(consumer);
        }
        return this.execArrayReply("XPENDING", key, group, ...args).then((raw)=>parseXPendingCounts(raw));
    }
    xrange(key, start, end, count) {
        const args = [
            key,
            xidstr(start),
            xidstr(end)
        ];
        if (count) {
            args.push("COUNT");
            args.push(count);
        }
        return this.execArrayReply("XRANGE", ...args).then((raw)=>raw.map((m)=>parseXMessage(m)));
    }
    xrevrange(key, start, end, count) {
        const args = [
            key,
            xidstr(start),
            xidstr(end)
        ];
        if (count) {
            args.push("COUNT");
            args.push(count);
        }
        return this.execArrayReply("XREVRANGE", ...args).then((raw)=>raw.map((m)=>parseXMessage(m)));
    }
    xread(keyXIds, opts) {
        const args = [];
        if (opts) {
            if (opts.count) {
                args.push("COUNT");
                args.push(opts.count);
            }
            if (opts.block) {
                args.push("BLOCK");
                args.push(opts.block);
            }
        }
        args.push("STREAMS");
        const theKeys = [];
        const theXIds = [];
        for (const a of keyXIds){
            if (a instanceof Array) {
                // XKeyIdLike
                theKeys.push(a[0]);
                theXIds.push(xidstr(a[1]));
            } else {
                // XKeyId
                theKeys.push(a.key);
                theXIds.push(xidstr(a.xid));
            }
        }
        return this.execArrayReply("XREAD", ...args.concat(theKeys).concat(theXIds)).then((raw)=>parseXReadReply(raw));
    }
    xreadgroup(keyXIds, { group , consumer , count , block  }) {
        const args = [
            "GROUP",
            group,
            consumer
        ];
        if (count) {
            args.push("COUNT");
            args.push(count);
        }
        if (block) {
            args.push("BLOCK");
            args.push(block);
        }
        args.push("STREAMS");
        const theKeys = [];
        const theXIds = [];
        for (const a of keyXIds){
            if (a instanceof Array) {
                // XKeyIdGroupLike
                theKeys.push(a[0]);
                theXIds.push(a[1] === ">" ? ">" : xidstr(a[1]));
            } else {
                // XKeyIdGroup
                theKeys.push(a.key);
                theXIds.push(a.xid === ">" ? ">" : xidstr(a.xid));
            }
        }
        return this.execArrayReply("XREADGROUP", ...args.concat(theKeys).concat(theXIds)).then((raw)=>parseXReadReply(raw));
    }
    xtrim(key, maxlen) {
        const args = [];
        if (maxlen.approx) {
            args.push("~");
        }
        args.push(maxlen.elements);
        return this.execIntegerReply("XTRIM", key, "MAXLEN", ...args);
    }
    zadd(key, param1, param2, opts) {
        const args = [
            key
        ];
        if (Array.isArray(param1)) {
            this.pushZAddOpts(args, param2);
            args.push(...param1.flatMap((e)=>e));
            opts = param2;
        } else if (typeof param1 === "object") {
            this.pushZAddOpts(args, param2);
            for (const [member, score] of Object.entries(param1)){
                args.push(score, member);
            }
        } else {
            this.pushZAddOpts(args, opts);
            args.push(param1, param2);
        }
        return this.execIntegerReply("ZADD", ...args);
    }
    pushZAddOpts(args, opts) {
        if (opts?.mode) {
            args.push(opts.mode);
        }
        if (opts?.ch) {
            args.push("CH");
        }
    }
    zaddIncr(key, score, member, opts) {
        const args = [
            key
        ];
        this.pushZAddOpts(args, opts);
        args.push("INCR", score, member);
        return this.execBulkReply("ZADD", ...args);
    }
    zcard(key) {
        return this.execIntegerReply("ZCARD", key);
    }
    zcount(key, min, max) {
        return this.execIntegerReply("ZCOUNT", key, min, max);
    }
    zincrby(key, increment, member) {
        return this.execBulkReply("ZINCRBY", key, increment, member);
    }
    zinter(keys, opts) {
        const args = this.pushZStoreArgs([], keys, opts);
        if (opts?.withScore) {
            args.push("WITHSCORES");
        }
        return this.execArrayReply("ZINTER", ...args);
    }
    zinterstore(destination, keys, opts) {
        const args = this.pushZStoreArgs([
            destination
        ], keys, opts);
        return this.execIntegerReply("ZINTERSTORE", ...args);
    }
    zunionstore(destination, keys, opts) {
        const args = this.pushZStoreArgs([
            destination
        ], keys, opts);
        return this.execIntegerReply("ZUNIONSTORE", ...args);
    }
    pushZStoreArgs(args, keys, opts) {
        if (Array.isArray(keys)) {
            args.push(keys.length);
            if (Array.isArray(keys[0])) {
                keys = keys;
                args.push(...keys.map((e)=>e[0]));
                args.push("WEIGHTS");
                args.push(...keys.map((e)=>e[1]));
            } else {
                args.push(...keys);
            }
        } else {
            args.push(Object.keys(keys).length);
            args.push(...Object.keys(keys));
            args.push("WEIGHTS");
            args.push(...Object.values(keys));
        }
        if (opts?.aggregate) {
            args.push("AGGREGATE", opts.aggregate);
        }
        return args;
    }
    zlexcount(key, min, max) {
        return this.execIntegerReply("ZLEXCOUNT", key, min, max);
    }
    zpopmax(key, count) {
        if (count !== undefined) {
            return this.execArrayReply("ZPOPMAX", key, count);
        }
        return this.execArrayReply("ZPOPMAX", key);
    }
    zpopmin(key, count) {
        if (count !== undefined) {
            return this.execArrayReply("ZPOPMIN", key, count);
        }
        return this.execArrayReply("ZPOPMIN", key);
    }
    zrange(key, start, stop, opts) {
        const args = this.pushZRangeOpts([
            key,
            start,
            stop
        ], opts);
        return this.execArrayReply("ZRANGE", ...args);
    }
    zrangebylex(key, min, max, opts) {
        const args = this.pushZRangeOpts([
            key,
            min,
            max
        ], opts);
        return this.execArrayReply("ZRANGEBYLEX", ...args);
    }
    zrangebyscore(key, min, max, opts) {
        const args = this.pushZRangeOpts([
            key,
            min,
            max
        ], opts);
        return this.execArrayReply("ZRANGEBYSCORE", ...args);
    }
    zrank(key, member) {
        return this.execIntegerOrNilReply("ZRANK", key, member);
    }
    zrem(key, ...members) {
        return this.execIntegerReply("ZREM", key, ...members);
    }
    zremrangebylex(key, min, max) {
        return this.execIntegerReply("ZREMRANGEBYLEX", key, min, max);
    }
    zremrangebyrank(key, start, stop) {
        return this.execIntegerReply("ZREMRANGEBYRANK", key, start, stop);
    }
    zremrangebyscore(key, min, max) {
        return this.execIntegerReply("ZREMRANGEBYSCORE", key, min, max);
    }
    zrevrange(key, start, stop, opts) {
        const args = this.pushZRangeOpts([
            key,
            start,
            stop
        ], opts);
        return this.execArrayReply("ZREVRANGE", ...args);
    }
    zrevrangebylex(key, max, min, opts) {
        const args = this.pushZRangeOpts([
            key,
            min,
            max
        ], opts);
        return this.execArrayReply("ZREVRANGEBYLEX", ...args);
    }
    zrevrangebyscore(key, max, min, opts) {
        const args = this.pushZRangeOpts([
            key,
            max,
            min
        ], opts);
        return this.execArrayReply("ZREVRANGEBYSCORE", ...args);
    }
    pushZRangeOpts(args, opts) {
        if (opts?.withScore) {
            args.push("WITHSCORES");
        }
        if (opts?.limit) {
            args.push("LIMIT", opts.limit.offset, opts.limit.count);
        }
        return args;
    }
    zrevrank(key, member) {
        return this.execIntegerOrNilReply("ZREVRANK", key, member);
    }
    zscore(key, member) {
        return this.execBulkReply("ZSCORE", key, member);
    }
    scan(cursor, opts) {
        const args = this.pushScanOpts([
            cursor
        ], opts);
        return this.execArrayReply("SCAN", ...args);
    }
    sscan(key, cursor, opts) {
        const args = this.pushScanOpts([
            key,
            cursor
        ], opts);
        return this.execArrayReply("SSCAN", ...args);
    }
    hscan(key, cursor, opts) {
        const args = this.pushScanOpts([
            key,
            cursor
        ], opts);
        return this.execArrayReply("HSCAN", ...args);
    }
    zscan(key, cursor, opts) {
        const args = this.pushScanOpts([
            key,
            cursor
        ], opts);
        return this.execArrayReply("ZSCAN", ...args);
    }
    pushScanOpts(args, opts) {
        if (opts?.pattern !== undefined) {
            args.push("MATCH", opts.pattern);
        }
        if (opts?.count !== undefined) {
            args.push("COUNT", opts.count);
        }
        if (opts?.type !== undefined) {
            args.push("TYPE", opts.type);
        }
        return args;
    }
    tx() {
        return createRedisPipeline(this.executor.connection, true);
    }
    pipeline() {
        return createRedisPipeline(this.executor.connection);
    }
}
/**
 * Connect to Redis server
 * @param options
 * @example
 * ```ts
 * import { connect } from "./mod.ts";
 * const conn1 = await connect({hostname: "127.0.0.1", port: 6379}); // -> TCP, 127.0.0.1:6379
 * const conn2 = await connect({hostname: "redis.proxy", port: 443, tls: true}); // -> TLS, redis.proxy:443
 * ```
 */ export async function connect(options) {
    const connection = createRedisConnection(options);
    await connection.connect();
    const executor = new DefaultExecutor(connection);
    return create(executor);
}
/**
 * Create a lazy Redis client that will not establish a connection until a command is actually executed.
 *
 * ```ts
 * import { createLazyClient } from "./mod.ts";
 *
 * const client = createLazyClient({ hostname: "127.0.0.1", port: 6379 });
 * console.assert(!client.isConnected);
 * await client.get("foo");
 * console.assert(client.isConnected);
 * ```
 */ export function createLazyClient(options) {
    const connection = createRedisConnection(options);
    const executor = createLazyExecutor(connection);
    return create(executor);
}
/**
 * Create a redis client from `CommandExecutor`
 */ export function create(executor) {
    return new RedisImpl(executor);
}
/**
 * Extract RedisConnectOptions from redis URL
 * @param url
 * @example
 * ```ts
 * import { parseURL } from "./mod.ts";
 *
 * parseURL("redis://foo:bar@localhost:6379/1"); // -> {hostname: "localhost", port: "6379", tls: false, db: 1, name: foo, password: bar}
 * parseURL("rediss://127.0.0.1:443/?db=2&password=bar"); // -> {hostname: "127.0.0.1", port: "443", tls: true, db: 2, name: undefined, password: bar}
 * ```
 */ export function parseURL(url) {
    const { protocol , hostname , port , username , password , pathname , searchParams  } = new URL(url);
    const db = pathname.replace("/", "") !== "" ? pathname.replace("/", "") : searchParams.get("db") ?? undefined;
    return {
        hostname: hostname !== "" ? hostname : "localhost",
        port: port !== "" ? parseInt(port, 10) : 6379,
        tls: protocol == "rediss:" ? true : searchParams.get("ssl") === "true",
        db: db ? parseInt(db, 10) : undefined,
        name: username !== "" ? username : undefined,
        password: password !== "" ? password : searchParams.get("password") ?? undefined
    };
}
function createRedisConnection(options) {
    const { hostname , port =6379 , ...opts } = options;
    return new RedisConnection(hostname, port, opts);
}
function createLazyExecutor(connection) {
    let executor = null;
    return {
        get connection () {
            return connection;
        },
        exec (command, ...args) {
            return this.sendCommand(command, args);
        },
        async sendCommand (command, args, options) {
            if (!executor) {
                executor = new DefaultExecutor(connection);
                if (!connection.isConnected) {
                    await connection.connect();
                }
            }
            return executor.sendCommand(command, args, options);
        },
        close () {
            if (executor) {
                return executor.close();
            }
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvcmVkaXNAdjAuMzEuMC9yZWRpcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7XG4gIEFDTExvZ01vZGUsXG4gIEJpdGZpZWxkT3B0cyxcbiAgQml0ZmllbGRXaXRoT3ZlcmZsb3dPcHRzLFxuICBDbGllbnRDYWNoaW5nTW9kZSxcbiAgQ2xpZW50S2lsbE9wdHMsXG4gIENsaWVudExpc3RPcHRzLFxuICBDbGllbnRQYXVzZU1vZGUsXG4gIENsaWVudFRyYWNraW5nT3B0cyxcbiAgQ2xpZW50VW5ibG9ja2luZ0JlaGF2aW91cixcbiAgQ2x1c3RlckZhaWxvdmVyTW9kZSxcbiAgQ2x1c3RlclJlc2V0TW9kZSxcbiAgQ2x1c3RlclNldFNsb3RTdWJjb21tYW5kLFxuICBHZW9SYWRpdXNPcHRzLFxuICBHZW9Vbml0LFxuICBIU2Nhbk9wdHMsXG4gIExJbnNlcnRMb2NhdGlvbixcbiAgTFBvc09wdHMsXG4gIExQb3NXaXRoQ291bnRPcHRzLFxuICBNZW1vcnlVc2FnZU9wdHMsXG4gIE1pZ3JhdGVPcHRzLFxuICBSZWRpc0NvbW1hbmRzLFxuICBSZXN0b3JlT3B0cyxcbiAgU2Nhbk9wdHMsXG4gIFNjcmlwdERlYnVnTW9kZSxcbiAgU2V0T3B0cyxcbiAgU2V0V2l0aE1vZGVPcHRzLFxuICBTaHV0ZG93bk1vZGUsXG4gIFNvcnRPcHRzLFxuICBTb3J0V2l0aERlc3RpbmF0aW9uT3B0cyxcbiAgU1NjYW5PcHRzLFxuICBTdHJhbGdvQWxnb3JpdGhtLFxuICBTdHJhbGdvT3B0cyxcbiAgU3RyYWxnb1RhcmdldCxcbiAgWkFkZE9wdHMsXG4gIFpJbnRlck9wdHMsXG4gIFpJbnRlcnN0b3JlT3B0cyxcbiAgWlJhbmdlQnlMZXhPcHRzLFxuICBaUmFuZ2VCeVNjb3JlT3B0cyxcbiAgWlJhbmdlT3B0cyxcbiAgWlNjYW5PcHRzLFxuICBaVW5pb25zdG9yZU9wdHMsXG59IGZyb20gXCIuL2NvbW1hbmQudHNcIjtcbmltcG9ydCB7IFJlZGlzQ29ubmVjdGlvbiB9IGZyb20gXCIuL2Nvbm5lY3Rpb24udHNcIjtcbmltcG9ydCB0eXBlIHsgQ29ubmVjdGlvbiwgU2VuZENvbW1hbmRPcHRpb25zIH0gZnJvbSBcIi4vY29ubmVjdGlvbi50c1wiO1xuaW1wb3J0IHR5cGUgeyBSZWRpc0Nvbm5lY3Rpb25PcHRpb25zIH0gZnJvbSBcIi4vY29ubmVjdGlvbi50c1wiO1xuaW1wb3J0IHsgQ29tbWFuZEV4ZWN1dG9yLCBEZWZhdWx0RXhlY3V0b3IgfSBmcm9tIFwiLi9leGVjdXRvci50c1wiO1xuaW1wb3J0IHR5cGUge1xuICBCaW5hcnksXG4gIEJ1bGssXG4gIEJ1bGtOaWwsXG4gIEJ1bGtTdHJpbmcsXG4gIENvbmRpdGlvbmFsQXJyYXksXG4gIEludGVnZXIsXG4gIFJhdyxcbiAgUmVkaXNSZXBseSxcbiAgUmVkaXNWYWx1ZSxcbiAgU2ltcGxlU3RyaW5nLFxufSBmcm9tIFwiLi9wcm90b2NvbC9tb2QudHNcIjtcbmltcG9ydCB7IGNyZWF0ZVJlZGlzUGlwZWxpbmUgfSBmcm9tIFwiLi9waXBlbGluZS50c1wiO1xuaW1wb3J0IHsgcHN1YnNjcmliZSwgc3Vic2NyaWJlIH0gZnJvbSBcIi4vcHVic3ViLnRzXCI7XG5pbXBvcnQge1xuICBjb252ZXJ0TWFwLFxuICBpc0NvbmRBcnJheSxcbiAgaXNOdW1iZXIsXG4gIGlzU3RyaW5nLFxuICBwYXJzZVhHcm91cERldGFpbCxcbiAgcGFyc2VYSWQsXG4gIHBhcnNlWE1lc3NhZ2UsXG4gIHBhcnNlWFBlbmRpbmdDb25zdW1lcnMsXG4gIHBhcnNlWFBlbmRpbmdDb3VudHMsXG4gIHBhcnNlWFJlYWRSZXBseSxcbiAgcmF3bnVtLFxuICByYXdzdHIsXG4gIFN0YXJ0RW5kQ291bnQsXG4gIFhBZGRGaWVsZFZhbHVlcyxcbiAgWENsYWltSnVzdFhJZCxcbiAgWENsYWltTWVzc2FnZXMsXG4gIFhDbGFpbU9wdHMsXG4gIFhJZCxcbiAgWElkQWRkLFxuICBYSWRJbnB1dCxcbiAgWElkTmVnLFxuICBYSWRQb3MsXG4gIHhpZHN0cixcbiAgWEtleUlkLFxuICBYS2V5SWRHcm91cCxcbiAgWEtleUlkR3JvdXBMaWtlLFxuICBYS2V5SWRMaWtlLFxuICBYTWF4bGVuLFxuICBYUmVhZEdyb3VwT3B0cyxcbiAgWFJlYWRJZERhdGEsXG4gIFhSZWFkT3B0cyxcbiAgWFJlYWRTdHJlYW1SYXcsXG59IGZyb20gXCIuL3N0cmVhbS50c1wiO1xuXG5jb25zdCBiaW5hcnlDb21tYW5kT3B0aW9ucyA9IHtcbiAgcmV0dXJuVWludDhBcnJheXM6IHRydWUsXG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlZGlzIGV4dGVuZHMgUmVkaXNDb21tYW5kcyB7XG4gIHJlYWRvbmx5IGlzQ2xvc2VkOiBib29sZWFuO1xuICByZWFkb25seSBpc0Nvbm5lY3RlZDogYm9vbGVhbjtcblxuICAvKipcbiAgICogTG93IGxldmVsIGludGVyZmFjZSBmb3IgUmVkaXMgc2VydmVyXG4gICAqL1xuICBzZW5kQ29tbWFuZChcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgYXJncz86IFJlZGlzVmFsdWVbXSxcbiAgICBvcHRpb25zPzogU2VuZENvbW1hbmRPcHRpb25zLFxuICApOiBQcm9taXNlPFJlZGlzUmVwbHk+O1xuICBjb25uZWN0KCk6IFByb21pc2U8dm9pZD47XG4gIGNsb3NlKCk6IHZvaWQ7XG59XG5cbmNsYXNzIFJlZGlzSW1wbCBpbXBsZW1lbnRzIFJlZGlzIHtcbiAgcHJpdmF0ZSByZWFkb25seSBleGVjdXRvcjogQ29tbWFuZEV4ZWN1dG9yO1xuXG4gIGdldCBpc0Nsb3NlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjdXRvci5jb25uZWN0aW9uLmlzQ2xvc2VkO1xuICB9XG5cbiAgZ2V0IGlzQ29ubmVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWN1dG9yLmNvbm5lY3Rpb24uaXNDb25uZWN0ZWQ7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihleGVjdXRvcjogQ29tbWFuZEV4ZWN1dG9yKSB7XG4gICAgdGhpcy5leGVjdXRvciA9IGV4ZWN1dG9yO1xuICB9XG5cbiAgc2VuZENvbW1hbmQoXG4gICAgY29tbWFuZDogc3RyaW5nLFxuICAgIGFyZ3M/OiBSZWRpc1ZhbHVlW10sXG4gICAgb3B0aW9ucz86IFNlbmRDb21tYW5kT3B0aW9ucyxcbiAgKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY3V0b3Iuc2VuZENvbW1hbmQoY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG4gIH1cblxuICBjb25uZWN0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLmV4ZWN1dG9yLmNvbm5lY3Rpb24uY29ubmVjdCgpO1xuICB9XG5cbiAgY2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5leGVjdXRvci5jbG9zZSgpO1xuICB9XG5cbiAgYXN5bmMgZXhlY1JlcGx5PFQgZXh0ZW5kcyBSYXcgPSBSYXc+KFxuICAgIGNvbW1hbmQ6IHN0cmluZyxcbiAgICAuLi5hcmdzOiBSZWRpc1ZhbHVlW11cbiAgKTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgcmVwbHkgPSBhd2FpdCB0aGlzLmV4ZWN1dG9yLmV4ZWMoXG4gICAgICBjb21tYW5kLFxuICAgICAgLi4uYXJncyxcbiAgICApO1xuICAgIHJldHVybiByZXBseSBhcyBUO1xuICB9XG5cbiAgYXN5bmMgZXhlY1N0YXR1c1JlcGx5KFxuICAgIGNvbW1hbmQ6IHN0cmluZyxcbiAgICAuLi5hcmdzOiBSZWRpc1ZhbHVlW11cbiAgKTogUHJvbWlzZTxTaW1wbGVTdHJpbmc+IHtcbiAgICBjb25zdCByZXBseSA9IGF3YWl0IHRoaXMuZXhlY3V0b3IuZXhlYyhjb21tYW5kLCAuLi5hcmdzKTtcbiAgICByZXR1cm4gcmVwbHkgYXMgU2ltcGxlU3RyaW5nO1xuICB9XG5cbiAgYXN5bmMgZXhlY0ludGVnZXJSZXBseShcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgLi4uYXJnczogUmVkaXNWYWx1ZVtdXG4gICk6IFByb21pc2U8SW50ZWdlcj4ge1xuICAgIGNvbnN0IHJlcGx5ID0gYXdhaXQgdGhpcy5leGVjdXRvci5leGVjKGNvbW1hbmQsIC4uLmFyZ3MpO1xuICAgIHJldHVybiByZXBseSBhcyBJbnRlZ2VyO1xuICB9XG5cbiAgYXN5bmMgZXhlY0JpbmFyeVJlcGx5KFxuICAgIGNvbW1hbmQ6IHN0cmluZyxcbiAgICAuLi5hcmdzOiBSZWRpc1ZhbHVlW11cbiAgKTogUHJvbWlzZTxCaW5hcnkgfCBCdWxrTmlsPiB7XG4gICAgY29uc3QgcmVwbHkgPSBhd2FpdCB0aGlzLmV4ZWN1dG9yLnNlbmRDb21tYW5kKFxuICAgICAgY29tbWFuZCxcbiAgICAgIGFyZ3MsXG4gICAgICBiaW5hcnlDb21tYW5kT3B0aW9ucyxcbiAgICApO1xuICAgIHJldHVybiByZXBseSBhcyBCaW5hcnkgfCBCdWxrTmlsO1xuICB9XG5cbiAgYXN5bmMgZXhlY0J1bGtSZXBseTxUIGV4dGVuZHMgQnVsayA9IEJ1bGs+KFxuICAgIGNvbW1hbmQ6IHN0cmluZyxcbiAgICAuLi5hcmdzOiBSZWRpc1ZhbHVlW11cbiAgKTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgcmVwbHkgPSBhd2FpdCB0aGlzLmV4ZWN1dG9yLmV4ZWMoY29tbWFuZCwgLi4uYXJncyk7XG4gICAgcmV0dXJuIHJlcGx5IGFzIFQ7XG4gIH1cblxuICBhc3luYyBleGVjQXJyYXlSZXBseTxUIGV4dGVuZHMgUmF3ID0gUmF3PihcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgLi4uYXJnczogUmVkaXNWYWx1ZVtdXG4gICk6IFByb21pc2U8VFtdPiB7XG4gICAgY29uc3QgcmVwbHkgPSBhd2FpdCB0aGlzLmV4ZWN1dG9yLmV4ZWMoY29tbWFuZCwgLi4uYXJncyk7XG4gICAgcmV0dXJuIHJlcGx5IGFzIEFycmF5PFQ+O1xuICB9XG5cbiAgYXN5bmMgZXhlY0ludGVnZXJPck5pbFJlcGx5KFxuICAgIGNvbW1hbmQ6IHN0cmluZyxcbiAgICAuLi5hcmdzOiBSZWRpc1ZhbHVlW11cbiAgKTogUHJvbWlzZTxJbnRlZ2VyIHwgQnVsa05pbD4ge1xuICAgIGNvbnN0IHJlcGx5ID0gYXdhaXQgdGhpcy5leGVjdXRvci5leGVjKGNvbW1hbmQsIC4uLmFyZ3MpO1xuICAgIHJldHVybiByZXBseSBhcyBJbnRlZ2VyIHwgQnVsa05pbDtcbiAgfVxuXG4gIGFzeW5jIGV4ZWNTdGF0dXNPck5pbFJlcGx5KFxuICAgIGNvbW1hbmQ6IHN0cmluZyxcbiAgICAuLi5hcmdzOiBSZWRpc1ZhbHVlW11cbiAgKTogUHJvbWlzZTxTaW1wbGVTdHJpbmcgfCBCdWxrTmlsPiB7XG4gICAgY29uc3QgcmVwbHkgPSBhd2FpdCB0aGlzLmV4ZWN1dG9yLmV4ZWMoY29tbWFuZCwgLi4uYXJncyk7XG4gICAgcmV0dXJuIHJlcGx5IGFzIFNpbXBsZVN0cmluZyB8IEJ1bGtOaWw7XG4gIH1cblxuICBhY2xDYXQoY2F0ZWdvcnluYW1lPzogc3RyaW5nKSB7XG4gICAgaWYgKGNhdGVnb3J5bmFtZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIkFDTFwiLCBcIkNBVFwiLCBjYXRlZ29yeW5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIkFDTFwiLCBcIkNBVFwiKTtcbiAgfVxuXG4gIGFjbERlbFVzZXIoLi4udXNlcm5hbWVzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJBQ0xcIiwgXCJERUxVU0VSXCIsIC4uLnVzZXJuYW1lcyk7XG4gIH1cblxuICBhY2xHZW5QYXNzKGJpdHM/OiBudW1iZXIpIHtcbiAgICBpZiAoYml0cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5leGVjQnVsa1JlcGx5PEJ1bGtTdHJpbmc+KFwiQUNMXCIsIFwiR0VOUEFTU1wiLCBiaXRzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseTxCdWxrU3RyaW5nPihcIkFDTFwiLCBcIkdFTlBBU1NcIik7XG4gIH1cblxuICBhY2xHZXRVc2VyKHVzZXJuYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nIHwgQnVsa1N0cmluZ1tdPihcbiAgICAgIFwiQUNMXCIsXG4gICAgICBcIkdFVFVTRVJcIixcbiAgICAgIHVzZXJuYW1lLFxuICAgICk7XG4gIH1cblxuICBhY2xIZWxwKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEJ1bGtTdHJpbmc+KFwiQUNMXCIsIFwiSEVMUFwiKTtcbiAgfVxuXG4gIGFjbExpc3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJBQ0xcIiwgXCJMSVNUXCIpO1xuICB9XG5cbiAgYWNsTG9hZCgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJBQ0xcIiwgXCJMT0FEXCIpO1xuICB9XG5cbiAgYWNsTG9nKGNvdW50OiBudW1iZXIpOiBQcm9taXNlPEJ1bGtTdHJpbmdbXT47XG4gIGFjbExvZyhtb2RlOiBBQ0xMb2dNb2RlKTogUHJvbWlzZTxTaW1wbGVTdHJpbmc+O1xuICBhY2xMb2cocGFyYW06IG51bWJlciB8IEFDTExvZ01vZGUpIHtcbiAgICBpZiAocGFyYW0gPT09IFwiUkVTRVRcIikge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiQUNMXCIsIFwiTE9HXCIsIFwiUkVTRVRcIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEJ1bGtTdHJpbmc+KFwiQUNMXCIsIFwiTE9HXCIsIHBhcmFtKTtcbiAgfVxuXG4gIGFjbFNhdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiQUNMXCIsIFwiU0FWRVwiKTtcbiAgfVxuXG4gIGFjbFNldFVzZXIodXNlcm5hbWU6IHN0cmluZywgLi4ucnVsZXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiQUNMXCIsIFwiU0VUVVNFUlwiLCB1c2VybmFtZSwgLi4ucnVsZXMpO1xuICB9XG5cbiAgYWNsVXNlcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJBQ0xcIiwgXCJVU0VSU1wiKTtcbiAgfVxuXG4gIGFjbFdob2FtaSgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQnVsa1JlcGx5PEJ1bGtTdHJpbmc+KFwiQUNMXCIsIFwiV0hPQU1JXCIpO1xuICB9XG5cbiAgYXBwZW5kKGtleTogc3RyaW5nLCB2YWx1ZTogUmVkaXNWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJBUFBFTkRcIiwga2V5LCB2YWx1ZSk7XG4gIH1cblxuICBhdXRoKHBhcmFtMTogUmVkaXNWYWx1ZSwgcGFyYW0yPzogUmVkaXNWYWx1ZSkge1xuICAgIGlmIChwYXJhbTIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiQVVUSFwiLCBwYXJhbTEsIHBhcmFtMik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkFVVEhcIiwgcGFyYW0xKTtcbiAgfVxuXG4gIGJncmV3cml0ZWFvZigpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJCR1JFV1JJVEVBT0ZcIik7XG4gIH1cblxuICBiZ3NhdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiQkdTQVZFXCIpO1xuICB9XG5cbiAgYml0Y291bnQoa2V5OiBzdHJpbmcsIHN0YXJ0PzogbnVtYmVyLCBlbmQ/OiBudW1iZXIpIHtcbiAgICBpZiAoc3RhcnQgIT09IHVuZGVmaW5lZCAmJiBlbmQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkJJVENPVU5UXCIsIGtleSwgc3RhcnQsIGVuZCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJCSVRDT1VOVFwiLCBrZXkpO1xuICB9XG5cbiAgYml0ZmllbGQoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgb3B0cz86IEJpdGZpZWxkT3B0cyB8IEJpdGZpZWxkV2l0aE92ZXJmbG93T3B0cyxcbiAgKSB7XG4gICAgY29uc3QgYXJnczogKG51bWJlciB8IHN0cmluZylbXSA9IFtrZXldO1xuICAgIGlmIChvcHRzPy5nZXQpIHtcbiAgICAgIGNvbnN0IHsgdHlwZSwgb2Zmc2V0IH0gPSBvcHRzLmdldDtcbiAgICAgIGFyZ3MucHVzaChcIkdFVFwiLCB0eXBlLCBvZmZzZXQpO1xuICAgIH1cbiAgICBpZiAob3B0cz8uc2V0KSB7XG4gICAgICBjb25zdCB7IHR5cGUsIG9mZnNldCwgdmFsdWUgfSA9IG9wdHMuc2V0O1xuICAgICAgYXJncy5wdXNoKFwiU0VUXCIsIHR5cGUsIG9mZnNldCwgdmFsdWUpO1xuICAgIH1cbiAgICBpZiAob3B0cz8uaW5jcmJ5KSB7XG4gICAgICBjb25zdCB7IHR5cGUsIG9mZnNldCwgaW5jcmVtZW50IH0gPSBvcHRzLmluY3JieTtcbiAgICAgIGFyZ3MucHVzaChcIklOQ1JCWVwiLCB0eXBlLCBvZmZzZXQsIGluY3JlbWVudCk7XG4gICAgfVxuICAgIGlmICgob3B0cyBhcyBCaXRmaWVsZFdpdGhPdmVyZmxvd09wdHMpPy5vdmVyZmxvdykge1xuICAgICAgYXJncy5wdXNoKFwiT1ZFUkZMT1dcIiwgKG9wdHMgYXMgQml0ZmllbGRXaXRoT3ZlcmZsb3dPcHRzKS5vdmVyZmxvdyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEludGVnZXI+KFwiQklURklFTERcIiwgLi4uYXJncyk7XG4gIH1cblxuICBiaXRvcChvcGVyYXRpb246IHN0cmluZywgZGVzdGtleTogc3RyaW5nLCAuLi5rZXlzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJCSVRPUFwiLCBvcGVyYXRpb24sIGRlc3RrZXksIC4uLmtleXMpO1xuICB9XG5cbiAgYml0cG9zKGtleTogc3RyaW5nLCBiaXQ6IG51bWJlciwgc3RhcnQ/OiBudW1iZXIsIGVuZD86IG51bWJlcikge1xuICAgIGlmIChzdGFydCAhPT0gdW5kZWZpbmVkICYmIGVuZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiQklUUE9TXCIsIGtleSwgYml0LCBzdGFydCwgZW5kKTtcbiAgICB9XG4gICAgaWYgKHN0YXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJCSVRQT1NcIiwga2V5LCBiaXQsIHN0YXJ0KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkJJVFBPU1wiLCBrZXksIGJpdCk7XG4gIH1cblxuICBibHBvcCh0aW1lb3V0OiBudW1iZXIsIC4uLmtleXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHkoXCJCTFBPUFwiLCAuLi5rZXlzLCB0aW1lb3V0KSBhcyBQcm9taXNlPFxuICAgICAgW0J1bGtTdHJpbmcsIEJ1bGtTdHJpbmddIHwgQnVsa05pbFxuICAgID47XG4gIH1cblxuICBicnBvcCh0aW1lb3V0OiBudW1iZXIsIC4uLmtleXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHkoXCJCUlBPUFwiLCAuLi5rZXlzLCB0aW1lb3V0KSBhcyBQcm9taXNlPFxuICAgICAgW0J1bGtTdHJpbmcsIEJ1bGtTdHJpbmddIHwgQnVsa05pbFxuICAgID47XG4gIH1cblxuICBicnBvcGxwdXNoKHNvdXJjZTogc3RyaW5nLCBkZXN0aW5hdGlvbjogc3RyaW5nLCB0aW1lb3V0OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQnVsa1JlcGx5KFwiQlJQT1BMUFVTSFwiLCBzb3VyY2UsIGRlc3RpbmF0aW9uLCB0aW1lb3V0KTtcbiAgfVxuXG4gIGJ6cG9wbWluKHRpbWVvdXQ6IG51bWJlciwgLi4ua2V5czogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseShcIkJaUE9QTUlOXCIsIC4uLmtleXMsIHRpbWVvdXQpIGFzIFByb21pc2U8XG4gICAgICBbQnVsa1N0cmluZywgQnVsa1N0cmluZywgQnVsa1N0cmluZ10gfCBCdWxrTmlsXG4gICAgPjtcbiAgfVxuXG4gIGJ6cG9wbWF4KHRpbWVvdXQ6IG51bWJlciwgLi4ua2V5czogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseShcIkJaUE9QTUFYXCIsIC4uLmtleXMsIHRpbWVvdXQpIGFzIFByb21pc2U8XG4gICAgICBbQnVsa1N0cmluZywgQnVsa1N0cmluZywgQnVsa1N0cmluZ10gfCBCdWxrTmlsXG4gICAgPjtcbiAgfVxuXG4gIGNsaWVudENhY2hpbmcobW9kZTogQ2xpZW50Q2FjaGluZ01vZGUpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJDTElFTlRcIiwgXCJDQUNISU5HXCIsIG1vZGUpO1xuICB9XG5cbiAgY2xpZW50R2V0TmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQnVsa1JlcGx5KFwiQ0xJRU5UXCIsIFwiR0VUTkFNRVwiKTtcbiAgfVxuXG4gIGNsaWVudEdldFJlZGlyKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJDTElFTlRcIiwgXCJHRVRSRURJUlwiKTtcbiAgfVxuXG4gIGNsaWVudElEKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJDTElFTlRcIiwgXCJJRFwiKTtcbiAgfVxuXG4gIGNsaWVudEluZm8oKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseShcIkNMSUVOVFwiLCBcIklORk9cIik7XG4gIH1cblxuICBjbGllbnRLaWxsKG9wdHM6IENsaWVudEtpbGxPcHRzKSB7XG4gICAgY29uc3QgYXJnczogKHN0cmluZyB8IG51bWJlcilbXSA9IFtdO1xuICAgIGlmIChvcHRzLmFkZHIpIHtcbiAgICAgIGFyZ3MucHVzaChcIkFERFJcIiwgb3B0cy5hZGRyKTtcbiAgICB9XG4gICAgaWYgKG9wdHMubGFkZHIpIHtcbiAgICAgIGFyZ3MucHVzaChcIkxBRERSXCIsIG9wdHMubGFkZHIpO1xuICAgIH1cbiAgICBpZiAob3B0cy5pZCkge1xuICAgICAgYXJncy5wdXNoKFwiSURcIiwgb3B0cy5pZCk7XG4gICAgfVxuICAgIGlmIChvcHRzLnR5cGUpIHtcbiAgICAgIGFyZ3MucHVzaChcIlRZUEVcIiwgb3B0cy50eXBlKTtcbiAgICB9XG4gICAgaWYgKG9wdHMudXNlcikge1xuICAgICAgYXJncy5wdXNoKFwiVVNFUlwiLCBvcHRzLnVzZXIpO1xuICAgIH1cbiAgICBpZiAob3B0cy5za2lwbWUpIHtcbiAgICAgIGFyZ3MucHVzaChcIlNLSVBNRVwiLCBvcHRzLnNraXBtZSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJDTElFTlRcIiwgXCJLSUxMXCIsIC4uLmFyZ3MpO1xuICB9XG5cbiAgY2xpZW50TGlzdChvcHRzPzogQ2xpZW50TGlzdE9wdHMpIHtcbiAgICBpZiAob3B0cyAmJiBvcHRzLnR5cGUgJiYgb3B0cy5pZHMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9ubHkgb25lIG9mIGB0eXBlYCBvciBgaWRzYCBjYW4gYmUgc3BlY2lmaWVkXCIpO1xuICAgIH1cbiAgICBpZiAob3B0cyAmJiBvcHRzLnR5cGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4ZWNCdWxrUmVwbHkoXCJDTElFTlRcIiwgXCJMSVNUXCIsIFwiVFlQRVwiLCBvcHRzLnR5cGUpO1xuICAgIH1cbiAgICBpZiAob3B0cyAmJiBvcHRzLmlkcykge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseShcIkNMSUVOVFwiLCBcIkxJU1RcIiwgXCJJRFwiLCAuLi5vcHRzLmlkcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNCdWxrUmVwbHkoXCJDTElFTlRcIiwgXCJMSVNUXCIpO1xuICB9XG5cbiAgY2xpZW50UGF1c2UodGltZW91dDogbnVtYmVyLCBtb2RlPzogQ2xpZW50UGF1c2VNb2RlKSB7XG4gICAgaWYgKG1vZGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkNMSUVOVFwiLCBcIlBBVVNFXCIsIHRpbWVvdXQsIG1vZGUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJDTElFTlRcIiwgXCJQQVVTRVwiLCB0aW1lb3V0KTtcbiAgfVxuXG4gIGNsaWVudFNldE5hbWUoY29ubmVjdGlvbk5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkNMSUVOVFwiLCBcIlNFVE5BTUVcIiwgY29ubmVjdGlvbk5hbWUpO1xuICB9XG5cbiAgY2xpZW50VHJhY2tpbmcob3B0czogQ2xpZW50VHJhY2tpbmdPcHRzKSB7XG4gICAgY29uc3QgYXJnczogKG51bWJlciB8IHN0cmluZylbXSA9IFtvcHRzLm1vZGVdO1xuICAgIGlmIChvcHRzLnJlZGlyZWN0KSB7XG4gICAgICBhcmdzLnB1c2goXCJSRURJUkVDVFwiLCBvcHRzLnJlZGlyZWN0KTtcbiAgICB9XG4gICAgaWYgKG9wdHMucHJlZml4ZXMpIHtcbiAgICAgIG9wdHMucHJlZml4ZXMuZm9yRWFjaCgocHJlZml4KSA9PiB7XG4gICAgICAgIGFyZ3MucHVzaChcIlBSRUZJWFwiKTtcbiAgICAgICAgYXJncy5wdXNoKHByZWZpeCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKG9wdHMuYmNhc3QpIHtcbiAgICAgIGFyZ3MucHVzaChcIkJDQVNUXCIpO1xuICAgIH1cbiAgICBpZiAob3B0cy5vcHRJbikge1xuICAgICAgYXJncy5wdXNoKFwiT1BUSU5cIik7XG4gICAgfVxuICAgIGlmIChvcHRzLm9wdE91dCkge1xuICAgICAgYXJncy5wdXNoKFwiT1BUT1VUXCIpO1xuICAgIH1cbiAgICBpZiAob3B0cy5ub0xvb3ApIHtcbiAgICAgIGFyZ3MucHVzaChcIk5PTE9PUFwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiQ0xJRU5UXCIsIFwiVFJBQ0tJTkdcIiwgLi4uYXJncyk7XG4gIH1cblxuICBjbGllbnRUcmFja2luZ0luZm8oKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHkoXCJDTElFTlRcIiwgXCJUUkFDS0lOR0lORk9cIik7XG4gIH1cblxuICBjbGllbnRVbmJsb2NrKFxuICAgIGlkOiBudW1iZXIsXG4gICAgYmVoYXZpb3VyPzogQ2xpZW50VW5ibG9ja2luZ0JlaGF2aW91cixcbiAgKTogUHJvbWlzZTxJbnRlZ2VyPiB7XG4gICAgaWYgKGJlaGF2aW91cikge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkNMSUVOVFwiLCBcIlVOQkxPQ0tcIiwgaWQsIGJlaGF2aW91cik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJDTElFTlRcIiwgXCJVTkJMT0NLXCIsIGlkKTtcbiAgfVxuXG4gIGNsaWVudFVucGF1c2UoKTogUHJvbWlzZTxTaW1wbGVTdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJDTElFTlRcIiwgXCJVTlBBVVNFXCIpO1xuICB9XG5cbiAgYXNraW5nKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkFTS0lOR1wiKTtcbiAgfVxuXG4gIGNsdXN0ZXJBZGRTbG90cyguLi5zbG90czogbnVtYmVyW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJDTFVTVEVSXCIsIFwiQUREU0xPVFNcIiwgLi4uc2xvdHMpO1xuICB9XG5cbiAgY2x1c3RlckNvdW50RmFpbHVyZVJlcG9ydHMobm9kZUlkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiQ0xVU1RFUlwiLCBcIkNPVU5ULUZBSUxVUkUtUkVQT1JUU1wiLCBub2RlSWQpO1xuICB9XG5cbiAgY2x1c3RlckNvdW50S2V5c0luU2xvdChzbG90OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiQ0xVU1RFUlwiLCBcIkNPVU5US0VZU0lOU0xPVFwiLCBzbG90KTtcbiAgfVxuXG4gIGNsdXN0ZXJEZWxTbG90cyguLi5zbG90czogbnVtYmVyW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJDTFVTVEVSXCIsIFwiREVMU0xPVFNcIiwgLi4uc2xvdHMpO1xuICB9XG5cbiAgY2x1c3RlckZhaWxvdmVyKG1vZGU/OiBDbHVzdGVyRmFpbG92ZXJNb2RlKSB7XG4gICAgaWYgKG1vZGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkNMVVNURVJcIiwgXCJGQUlMT1ZFUlwiLCBtb2RlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiQ0xVU1RFUlwiLCBcIkZBSUxPVkVSXCIpO1xuICB9XG5cbiAgY2x1c3RlckZsdXNoU2xvdHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiQ0xVU1RFUlwiLCBcIkZMVVNIU0xPVFNcIik7XG4gIH1cblxuICBjbHVzdGVyRm9yZ2V0KG5vZGVJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiQ0xVU1RFUlwiLCBcIkZPUkdFVFwiLCBub2RlSWQpO1xuICB9XG5cbiAgY2x1c3RlckdldEtleXNJblNsb3Qoc2xvdDogbnVtYmVyLCBjb3VudDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXG4gICAgICBcIkNMVVNURVJcIixcbiAgICAgIFwiR0VUS0VZU0lOU0xPVFwiLFxuICAgICAgc2xvdCxcbiAgICAgIGNvdW50LFxuICAgICk7XG4gIH1cblxuICBjbHVzdGVySW5mbygpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJDTFVTVEVSXCIsIFwiSU5GT1wiKTtcbiAgfVxuXG4gIGNsdXN0ZXJLZXlTbG90KGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkNMVVNURVJcIiwgXCJLRVlTTE9UXCIsIGtleSk7XG4gIH1cblxuICBjbHVzdGVyTWVldChpcDogc3RyaW5nLCBwb3J0OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJDTFVTVEVSXCIsIFwiTUVFVFwiLCBpcCwgcG9ydCk7XG4gIH1cblxuICBjbHVzdGVyTXlJRCgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJDTFVTVEVSXCIsIFwiTVlJRFwiKTtcbiAgfVxuXG4gIGNsdXN0ZXJOb2RlcygpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQnVsa1JlcGx5PEJ1bGtTdHJpbmc+KFwiQ0xVU1RFUlwiLCBcIk5PREVTXCIpO1xuICB9XG5cbiAgY2x1c3RlclJlcGxpY2FzKG5vZGVJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJDTFVTVEVSXCIsIFwiUkVQTElDQVNcIiwgbm9kZUlkKTtcbiAgfVxuXG4gIGNsdXN0ZXJSZXBsaWNhdGUobm9kZUlkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJDTFVTVEVSXCIsIFwiUkVQTElDQVRFXCIsIG5vZGVJZCk7XG4gIH1cblxuICBjbHVzdGVyUmVzZXQobW9kZT86IENsdXN0ZXJSZXNldE1vZGUpIHtcbiAgICBpZiAobW9kZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiQ0xVU1RFUlwiLCBcIlJFU0VUXCIsIG1vZGUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJDTFVTVEVSXCIsIFwiUkVTRVRcIik7XG4gIH1cblxuICBjbHVzdGVyU2F2ZUNvbmZpZygpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJDTFVTVEVSXCIsIFwiU0FWRUNPTkZJR1wiKTtcbiAgfVxuXG4gIGNsdXN0ZXJTZXRTbG90KFxuICAgIHNsb3Q6IG51bWJlcixcbiAgICBzdWJjb21tYW5kOiBDbHVzdGVyU2V0U2xvdFN1YmNvbW1hbmQsXG4gICAgbm9kZUlkPzogc3RyaW5nLFxuICApIHtcbiAgICBpZiAobm9kZUlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcbiAgICAgICAgXCJDTFVTVEVSXCIsXG4gICAgICAgIFwiU0VUU0xPVFwiLFxuICAgICAgICBzbG90LFxuICAgICAgICBzdWJjb21tYW5kLFxuICAgICAgICBub2RlSWQsXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJDTFVTVEVSXCIsIFwiU0VUU0xPVFwiLCBzbG90LCBzdWJjb21tYW5kKTtcbiAgfVxuXG4gIGNsdXN0ZXJTbGF2ZXMobm9kZUlkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIkNMVVNURVJcIiwgXCJTTEFWRVNcIiwgbm9kZUlkKTtcbiAgfVxuXG4gIGNsdXN0ZXJTbG90cygpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseShcIkNMVVNURVJcIiwgXCJTTE9UU1wiKTtcbiAgfVxuXG4gIGNvbW1hbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHkoXCJDT01NQU5EXCIpIGFzIFByb21pc2U8XG4gICAgICBbQnVsa1N0cmluZywgSW50ZWdlciwgQnVsa1N0cmluZ1tdLCBJbnRlZ2VyLCBJbnRlZ2VyLCBJbnRlZ2VyXVtdXG4gICAgPjtcbiAgfVxuXG4gIGNvbW1hbmRDb3VudCgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiQ09NTUFORFwiLCBcIkNPVU5UXCIpO1xuICB9XG5cbiAgY29tbWFuZEdldEtleXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJDT01NQU5EXCIsIFwiR0VUS0VZU1wiKTtcbiAgfVxuXG4gIGNvbW1hbmRJbmZvKC4uLmNvbW1hbmROYW1lczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseShcIkNPTU1BTkRcIiwgXCJJTkZPXCIsIC4uLmNvbW1hbmROYW1lcykgYXMgUHJvbWlzZTxcbiAgICAgIChcbiAgICAgICAgfCBbQnVsa1N0cmluZywgSW50ZWdlciwgQnVsa1N0cmluZ1tdLCBJbnRlZ2VyLCBJbnRlZ2VyLCBJbnRlZ2VyXVxuICAgICAgICB8IEJ1bGtOaWxcbiAgICAgIClbXVxuICAgID47XG4gIH1cblxuICBjb25maWdHZXQocGFyYW1ldGVyOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIkNPTkZJR1wiLCBcIkdFVFwiLCBwYXJhbWV0ZXIpO1xuICB9XG5cbiAgY29uZmlnUmVzZXRTdGF0KCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkNPTkZJR1wiLCBcIlJFU0VUU1RBVFwiKTtcbiAgfVxuXG4gIGNvbmZpZ1Jld3JpdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiQ09ORklHXCIsIFwiUkVXUklURVwiKTtcbiAgfVxuXG4gIGNvbmZpZ1NldChwYXJhbWV0ZXI6IHN0cmluZywgdmFsdWU6IHN0cmluZyB8IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkNPTkZJR1wiLCBcIlNFVFwiLCBwYXJhbWV0ZXIsIHZhbHVlKTtcbiAgfVxuXG4gIGRic2l6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiREJTSVpFXCIpO1xuICB9XG5cbiAgZGVidWdPYmplY3Qoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJERUJVR1wiLCBcIk9CSkVDVFwiLCBrZXkpO1xuICB9XG5cbiAgZGVidWdTZWdmYXVsdCgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJERUJVR1wiLCBcIlNFR0ZBVUxUXCIpO1xuICB9XG5cbiAgZGVjcihrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJERUNSXCIsIGtleSk7XG4gIH1cblxuICBkZWNyYnkoa2V5OiBzdHJpbmcsIGRlY3JlbWVudDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkRFQ1JCWVwiLCBrZXksIGRlY3JlbWVudCk7XG4gIH1cblxuICBkZWwoLi4ua2V5czogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiREVMXCIsIC4uLmtleXMpO1xuICB9XG5cbiAgZGlzY2FyZCgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJESVNDQVJEXCIpO1xuICB9XG5cbiAgZHVtcChrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNCaW5hcnlSZXBseShcIkRVTVBcIiwga2V5KTtcbiAgfVxuXG4gIGVjaG8obWVzc2FnZTogUmVkaXNWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNCdWxrUmVwbHk8QnVsa1N0cmluZz4oXCJFQ0hPXCIsIG1lc3NhZ2UpO1xuICB9XG5cbiAgZXZhbChzY3JpcHQ6IHN0cmluZywga2V5czogc3RyaW5nW10sIGFyZ3M6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1JlcGx5KFxuICAgICAgXCJFVkFMXCIsXG4gICAgICBzY3JpcHQsXG4gICAgICBrZXlzLmxlbmd0aCxcbiAgICAgIC4uLmtleXMsXG4gICAgICAuLi5hcmdzLFxuICAgICk7XG4gIH1cblxuICBldmFsc2hhKHNoYTE6IHN0cmluZywga2V5czogc3RyaW5nW10sIGFyZ3M6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1JlcGx5KFxuICAgICAgXCJFVkFMU0hBXCIsXG4gICAgICBzaGExLFxuICAgICAga2V5cy5sZW5ndGgsXG4gICAgICAuLi5rZXlzLFxuICAgICAgLi4uYXJncyxcbiAgICApO1xuICB9XG5cbiAgZXhlYygpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseShcIkVYRUNcIik7XG4gIH1cblxuICBleGlzdHMoLi4ua2V5czogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiRVhJU1RTXCIsIC4uLmtleXMpO1xuICB9XG5cbiAgZXhwaXJlKGtleTogc3RyaW5nLCBzZWNvbmRzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiRVhQSVJFXCIsIGtleSwgc2Vjb25kcyk7XG4gIH1cblxuICBleHBpcmVhdChrZXk6IHN0cmluZywgdGltZXN0YW1wOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiRVhQSVJFQVRcIiwga2V5LCB0aW1lc3RhbXApO1xuICB9XG5cbiAgZmx1c2hhbGwoYXN5bmM/OiBib29sZWFuKSB7XG4gICAgaWYgKGFzeW5jKSB7XG4gICAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJGTFVTSEFMTFwiLCBcIkFTWU5DXCIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJGTFVTSEFMTFwiKTtcbiAgfVxuXG4gIGZsdXNoZGIoYXN5bmM/OiBib29sZWFuKSB7XG4gICAgaWYgKGFzeW5jKSB7XG4gICAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJGTFVTSERCXCIsIFwiQVNZTkNcIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkZMVVNIREJcIik7XG4gIH1cblxuICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICBnZW9hZGQoa2V5OiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10pIHtcbiAgICBjb25zdCBhcmdzOiAoc3RyaW5nIHwgbnVtYmVyKVtdID0gW2tleV07XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocGFyYW1zWzBdKSkge1xuICAgICAgYXJncy5wdXNoKC4uLnBhcmFtcy5mbGF0TWFwKChlKSA9PiBlKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcGFyYW1zWzBdID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBmb3IgKGNvbnN0IFttZW1iZXIsIGxuZ2xhdF0gb2YgT2JqZWN0LmVudHJpZXMocGFyYW1zWzBdKSkge1xuICAgICAgICBhcmdzLnB1c2goLi4uKGxuZ2xhdCBhcyBbbnVtYmVyLCBudW1iZXJdKSwgbWVtYmVyKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYXJncy5wdXNoKC4uLnBhcmFtcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJHRU9BRERcIiwgLi4uYXJncyk7XG4gIH1cblxuICBnZW9oYXNoKGtleTogc3RyaW5nLCAuLi5tZW1iZXJzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEJ1bGs+KFwiR0VPSEFTSFwiLCBrZXksIC4uLm1lbWJlcnMpO1xuICB9XG5cbiAgZ2VvcG9zKGtleTogc3RyaW5nLCAuLi5tZW1iZXJzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5KFwiR0VPUE9TXCIsIGtleSwgLi4ubWVtYmVycykgYXMgUHJvbWlzZTxcbiAgICAgIChbQnVsa1N0cmluZywgQnVsa1N0cmluZ10gfCBCdWxrTmlsIHwgW10pW11cbiAgICA+O1xuICB9XG5cbiAgZ2VvZGlzdChcbiAgICBrZXk6IHN0cmluZyxcbiAgICBtZW1iZXIxOiBzdHJpbmcsXG4gICAgbWVtYmVyMjogc3RyaW5nLFxuICAgIHVuaXQ/OiBHZW9Vbml0LFxuICApIHtcbiAgICBpZiAodW5pdCkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseShcIkdFT0RJU1RcIiwga2V5LCBtZW1iZXIxLCBtZW1iZXIyLCB1bml0KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseShcIkdFT0RJU1RcIiwga2V5LCBtZW1iZXIxLCBtZW1iZXIyKTtcbiAgfVxuXG4gIGdlb3JhZGl1cyhcbiAgICBrZXk6IHN0cmluZyxcbiAgICBsb25naXR1ZGU6IG51bWJlcixcbiAgICBsYXRpdHVkZTogbnVtYmVyLFxuICAgIHJhZGl1czogbnVtYmVyLFxuICAgIHVuaXQ6IFwibVwiIHwgXCJrbVwiIHwgXCJmdFwiIHwgXCJtaVwiLFxuICAgIG9wdHM/OiBHZW9SYWRpdXNPcHRzLFxuICApIHtcbiAgICBjb25zdCBhcmdzID0gdGhpcy5wdXNoR2VvUmFkaXVzT3B0cyhcbiAgICAgIFtrZXksIGxvbmdpdHVkZSwgbGF0aXR1ZGUsIHJhZGl1cywgdW5pdF0sXG4gICAgICBvcHRzLFxuICAgICk7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHkoXCJHRU9SQURJVVNcIiwgLi4uYXJncyk7XG4gIH1cblxuICBnZW9yYWRpdXNieW1lbWJlcihcbiAgICBrZXk6IHN0cmluZyxcbiAgICBtZW1iZXI6IHN0cmluZyxcbiAgICByYWRpdXM6IG51bWJlcixcbiAgICB1bml0OiBHZW9Vbml0LFxuICAgIG9wdHM/OiBHZW9SYWRpdXNPcHRzLFxuICApIHtcbiAgICBjb25zdCBhcmdzID0gdGhpcy5wdXNoR2VvUmFkaXVzT3B0cyhba2V5LCBtZW1iZXIsIHJhZGl1cywgdW5pdF0sIG9wdHMpO1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5KFwiR0VPUkFESVVTQllNRU1CRVJcIiwgLi4uYXJncyk7XG4gIH1cblxuICBwcml2YXRlIHB1c2hHZW9SYWRpdXNPcHRzKFxuICAgIGFyZ3M6IChzdHJpbmcgfCBudW1iZXIpW10sXG4gICAgb3B0cz86IEdlb1JhZGl1c09wdHMsXG4gICkge1xuICAgIGlmIChvcHRzPy53aXRoQ29vcmQpIHtcbiAgICAgIGFyZ3MucHVzaChcIldJVEhDT09SRFwiKTtcbiAgICB9XG4gICAgaWYgKG9wdHM/LndpdGhEaXN0KSB7XG4gICAgICBhcmdzLnB1c2goXCJXSVRIRElTVFwiKTtcbiAgICB9XG4gICAgaWYgKG9wdHM/LndpdGhIYXNoKSB7XG4gICAgICBhcmdzLnB1c2goXCJXSVRISEFTSFwiKTtcbiAgICB9XG4gICAgaWYgKG9wdHM/LmNvdW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFyZ3MucHVzaChvcHRzLmNvdW50KTtcbiAgICB9XG4gICAgaWYgKG9wdHM/LnNvcnQpIHtcbiAgICAgIGFyZ3MucHVzaChvcHRzLnNvcnQpO1xuICAgIH1cbiAgICBpZiAob3B0cz8uc3RvcmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXJncy5wdXNoKG9wdHMuc3RvcmUpO1xuICAgIH1cbiAgICBpZiAob3B0cz8uc3RvcmVEaXN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFyZ3MucHVzaChvcHRzLnN0b3JlRGlzdCk7XG4gICAgfVxuICAgIHJldHVybiBhcmdzO1xuICB9XG5cbiAgZ2V0KGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseShcIkdFVFwiLCBrZXkpO1xuICB9XG5cbiAgZ2V0Yml0KGtleTogc3RyaW5nLCBvZmZzZXQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJHRVRCSVRcIiwga2V5LCBvZmZzZXQpO1xuICB9XG5cbiAgZ2V0cmFuZ2Uoa2V5OiBzdHJpbmcsIHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseTxCdWxrU3RyaW5nPihcIkdFVFJBTkdFXCIsIGtleSwgc3RhcnQsIGVuZCk7XG4gIH1cblxuICBnZXRzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBSZWRpc1ZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseShcIkdFVFNFVFwiLCBrZXksIHZhbHVlKTtcbiAgfVxuXG4gIGhkZWwoa2V5OiBzdHJpbmcsIC4uLmZpZWxkczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiSERFTFwiLCBrZXksIC4uLmZpZWxkcyk7XG4gIH1cblxuICBoZXhpc3RzKGtleTogc3RyaW5nLCBmaWVsZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkhFWElTVFNcIiwga2V5LCBmaWVsZCk7XG4gIH1cblxuICBoZ2V0KGtleTogc3RyaW5nLCBmaWVsZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseShcIkhHRVRcIiwga2V5LCBmaWVsZCk7XG4gIH1cblxuICBoZ2V0YWxsKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJIR0VUQUxMXCIsIGtleSk7XG4gIH1cblxuICBoaW5jcmJ5KGtleTogc3RyaW5nLCBmaWVsZDogc3RyaW5nLCBpbmNyZW1lbnQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJISU5DUkJZXCIsIGtleSwgZmllbGQsIGluY3JlbWVudCk7XG4gIH1cblxuICBoaW5jcmJ5ZmxvYXQoa2V5OiBzdHJpbmcsIGZpZWxkOiBzdHJpbmcsIGluY3JlbWVudDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseTxCdWxrU3RyaW5nPihcbiAgICAgIFwiSElOQ1JCWUZMT0FUXCIsXG4gICAgICBrZXksXG4gICAgICBmaWVsZCxcbiAgICAgIGluY3JlbWVudCxcbiAgICApO1xuICB9XG5cbiAgaGtleXMoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIkhLRVlTXCIsIGtleSk7XG4gIH1cblxuICBobGVuKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkhMRU5cIiwga2V5KTtcbiAgfVxuXG4gIGhtZ2V0KGtleTogc3RyaW5nLCAuLi5maWVsZHM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsaz4oXCJITUdFVFwiLCBrZXksIC4uLmZpZWxkcyk7XG4gIH1cblxuICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICBobXNldChrZXk6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSkge1xuICAgIGNvbnN0IGFyZ3MgPSBba2V5XSBhcyBSZWRpc1ZhbHVlW107XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocGFyYW1zWzBdKSkge1xuICAgICAgYXJncy5wdXNoKC4uLnBhcmFtcy5mbGF0TWFwKChlKSA9PiBlKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcGFyYW1zWzBdID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBmb3IgKGNvbnN0IFtmaWVsZCwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHBhcmFtc1swXSkpIHtcbiAgICAgICAgYXJncy5wdXNoKGZpZWxkLCB2YWx1ZSBhcyBSZWRpc1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYXJncy5wdXNoKC4uLnBhcmFtcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkhNU0VUXCIsIC4uLmFyZ3MpO1xuICB9XG5cbiAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgaHNldChrZXk6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSkge1xuICAgIGNvbnN0IGFyZ3MgPSBba2V5XSBhcyBSZWRpc1ZhbHVlW107XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocGFyYW1zWzBdKSkge1xuICAgICAgYXJncy5wdXNoKC4uLnBhcmFtcy5mbGF0TWFwKChlKSA9PiBlKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcGFyYW1zWzBdID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBmb3IgKGNvbnN0IFtmaWVsZCwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHBhcmFtc1swXSkpIHtcbiAgICAgICAgYXJncy5wdXNoKGZpZWxkLCB2YWx1ZSBhcyBSZWRpc1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYXJncy5wdXNoKC4uLnBhcmFtcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJIU0VUXCIsIC4uLmFyZ3MpO1xuICB9XG5cbiAgaHNldG54KGtleTogc3RyaW5nLCBmaWVsZDogc3RyaW5nLCB2YWx1ZTogUmVkaXNWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJIU0VUTlhcIiwga2V5LCBmaWVsZCwgdmFsdWUpO1xuICB9XG5cbiAgaHN0cmxlbihrZXk6IHN0cmluZywgZmllbGQ6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJIU1RSTEVOXCIsIGtleSwgZmllbGQpO1xuICB9XG5cbiAgaHZhbHMoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIkhWQUxTXCIsIGtleSk7XG4gIH1cblxuICBpbmNyKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIklOQ1JcIiwga2V5KTtcbiAgfVxuXG4gIGluY3JieShrZXk6IHN0cmluZywgaW5jcmVtZW50OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiSU5DUkJZXCIsIGtleSwgaW5jcmVtZW50KTtcbiAgfVxuXG4gIGluY3JieWZsb2F0KGtleTogc3RyaW5nLCBpbmNyZW1lbnQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmV4ZWNCdWxrUmVwbHk8QnVsa1N0cmluZz4oXCJJTkNSQllGTE9BVFwiLCBrZXksIGluY3JlbWVudCk7XG4gIH1cblxuICBpbmZvKHNlY3Rpb24/OiBzdHJpbmcpIHtcbiAgICBpZiAoc2VjdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJJTkZPXCIsIHNlY3Rpb24pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJJTkZPXCIpO1xuICB9XG5cbiAga2V5cyhwYXR0ZXJuOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIktFWVNcIiwgcGF0dGVybik7XG4gIH1cblxuICBsYXN0c2F2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiTEFTVFNBVkVcIik7XG4gIH1cblxuICBsaW5kZXgoa2V5OiBzdHJpbmcsIGluZGV4OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQnVsa1JlcGx5KFwiTElOREVYXCIsIGtleSwgaW5kZXgpO1xuICB9XG5cbiAgbGluc2VydChrZXk6IHN0cmluZywgbG9jOiBMSW5zZXJ0TG9jYXRpb24sIHBpdm90OiBzdHJpbmcsIHZhbHVlOiBSZWRpc1ZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkxJTlNFUlRcIiwga2V5LCBsb2MsIHBpdm90LCB2YWx1ZSk7XG4gIH1cblxuICBsbGVuKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkxMRU5cIiwga2V5KTtcbiAgfVxuXG4gIGxwb3Aoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQnVsa1JlcGx5KFwiTFBPUFwiLCBrZXkpO1xuICB9XG5cbiAgbHBvcyhcbiAgICBrZXk6IHN0cmluZyxcbiAgICBlbGVtZW50OiBSZWRpc1ZhbHVlLFxuICAgIG9wdHM/OiBMUG9zT3B0cyxcbiAgKTogUHJvbWlzZTxJbnRlZ2VyIHwgQnVsa05pbD47XG5cbiAgbHBvcyhcbiAgICBrZXk6IHN0cmluZyxcbiAgICBlbGVtZW50OiBSZWRpc1ZhbHVlLFxuICAgIG9wdHM6IExQb3NXaXRoQ291bnRPcHRzLFxuICApOiBQcm9taXNlPEludGVnZXJbXT47XG5cbiAgbHBvcyhcbiAgICBrZXk6IHN0cmluZyxcbiAgICBlbGVtZW50OiBSZWRpc1ZhbHVlLFxuICAgIG9wdHM/OiBMUG9zT3B0cyB8IExQb3NXaXRoQ291bnRPcHRzLFxuICApOiBQcm9taXNlPEludGVnZXIgfCBCdWxrTmlsIHwgSW50ZWdlcltdPiB7XG4gICAgY29uc3QgYXJncyA9IFtlbGVtZW50XTtcbiAgICBpZiAob3B0cz8ucmFuayAhPSBudWxsKSB7XG4gICAgICBhcmdzLnB1c2goXCJSQU5LXCIsIFN0cmluZyhvcHRzLnJhbmspKTtcbiAgICB9XG5cbiAgICBpZiAob3B0cz8uY291bnQgIT0gbnVsbCkge1xuICAgICAgYXJncy5wdXNoKFwiQ09VTlRcIiwgU3RyaW5nKG9wdHMuY291bnQpKTtcbiAgICB9XG5cbiAgICBpZiAob3B0cz8ubWF4bGVuICE9IG51bGwpIHtcbiAgICAgIGFyZ3MucHVzaChcIk1BWExFTlwiLCBTdHJpbmcob3B0cy5tYXhsZW4pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3B0cz8uY291bnQgPT0gbnVsbFxuICAgICAgPyB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJMUE9TXCIsIGtleSwgLi4uYXJncylcbiAgICAgIDogdGhpcy5leGVjQXJyYXlSZXBseTxJbnRlZ2VyPihcIkxQT1NcIiwga2V5LCAuLi5hcmdzKTtcbiAgfVxuXG4gIGxwdXNoKGtleTogc3RyaW5nLCAuLi5lbGVtZW50czogUmVkaXNWYWx1ZVtdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkxQVVNIXCIsIGtleSwgLi4uZWxlbWVudHMpO1xuICB9XG5cbiAgbHB1c2h4KGtleTogc3RyaW5nLCAuLi5lbGVtZW50czogUmVkaXNWYWx1ZVtdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkxQVVNIWFwiLCBrZXksIC4uLmVsZW1lbnRzKTtcbiAgfVxuXG4gIGxyYW5nZShrZXk6IHN0cmluZywgc3RhcnQ6IG51bWJlciwgc3RvcDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJMUkFOR0VcIiwga2V5LCBzdGFydCwgc3RvcCk7XG4gIH1cblxuICBscmVtKGtleTogc3RyaW5nLCBjb3VudDogbnVtYmVyLCBlbGVtZW50OiBzdHJpbmcgfCBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiTFJFTVwiLCBrZXksIGNvdW50LCBlbGVtZW50KTtcbiAgfVxuXG4gIGxzZXQoa2V5OiBzdHJpbmcsIGluZGV4OiBudW1iZXIsIGVsZW1lbnQ6IHN0cmluZyB8IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkxTRVRcIiwga2V5LCBpbmRleCwgZWxlbWVudCk7XG4gIH1cblxuICBsdHJpbShrZXk6IHN0cmluZywgc3RhcnQ6IG51bWJlciwgc3RvcDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiTFRSSU1cIiwga2V5LCBzdGFydCwgc3RvcCk7XG4gIH1cblxuICBtZW1vcnlEb2N0b3IoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseTxCdWxrU3RyaW5nPihcIk1FTU9SWVwiLCBcIkRPQ1RPUlwiKTtcbiAgfVxuXG4gIG1lbW9yeUhlbHAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJNRU1PUllcIiwgXCJIRUxQXCIpO1xuICB9XG5cbiAgbWVtb3J5TWFsbG9jU3RhdHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseTxCdWxrU3RyaW5nPihcIk1FTU9SWVwiLCBcIk1BTExPQ1wiLCBcIlNUQVRTXCIpO1xuICB9XG5cbiAgbWVtb3J5UHVyZ2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiTUVNT1JZXCIsIFwiUFVSR0VcIik7XG4gIH1cblxuICBtZW1vcnlTdGF0cygpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseShcIk1FTU9SWVwiLCBcIlNUQVRTXCIpO1xuICB9XG5cbiAgbWVtb3J5VXNhZ2Uoa2V5OiBzdHJpbmcsIG9wdHM/OiBNZW1vcnlVc2FnZU9wdHMpIHtcbiAgICBjb25zdCBhcmdzOiAobnVtYmVyIHwgc3RyaW5nKVtdID0gW2tleV07XG4gICAgaWYgKG9wdHM/LnNhbXBsZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXJncy5wdXNoKFwiU0FNUExFU1wiLCBvcHRzLnNhbXBsZXMpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiTUVNT1JZXCIsIFwiVVNBR0VcIiwgLi4uYXJncyk7XG4gIH1cblxuICBtZ2V0KC4uLmtleXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsaz4oXCJNR0VUXCIsIC4uLmtleXMpO1xuICB9XG5cbiAgbWlncmF0ZShcbiAgICBob3N0OiBzdHJpbmcsXG4gICAgcG9ydDogbnVtYmVyLFxuICAgIGtleTogc3RyaW5nLFxuICAgIGRlc3RpbmF0aW9uREI6IHN0cmluZyxcbiAgICB0aW1lb3V0OiBudW1iZXIsXG4gICAgb3B0cz86IE1pZ3JhdGVPcHRzLFxuICApIHtcbiAgICBjb25zdCBhcmdzID0gW2hvc3QsIHBvcnQsIGtleSwgZGVzdGluYXRpb25EQiwgdGltZW91dF07XG4gICAgaWYgKG9wdHM/LmNvcHkpIHtcbiAgICAgIGFyZ3MucHVzaChcIkNPUFlcIik7XG4gICAgfVxuICAgIGlmIChvcHRzPy5yZXBsYWNlKSB7XG4gICAgICBhcmdzLnB1c2goXCJSRVBMQUNFXCIpO1xuICAgIH1cbiAgICBpZiAob3B0cz8uYXV0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhcmdzLnB1c2goXCJBVVRIXCIsIG9wdHMuYXV0aCk7XG4gICAgfVxuICAgIGlmIChvcHRzPy5rZXlzKSB7XG4gICAgICBhcmdzLnB1c2goXCJLRVlTXCIsIC4uLm9wdHMua2V5cyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIk1JR1JBVEVcIiwgLi4uYXJncyk7XG4gIH1cblxuICBtb2R1bGVMaXN0KCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEJ1bGtTdHJpbmc+KFwiTU9EVUxFXCIsIFwiTElTVFwiKTtcbiAgfVxuXG4gIG1vZHVsZUxvYWQocGF0aDogc3RyaW5nLCAuLi5hcmdzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIk1PRFVMRVwiLCBcIkxPQURcIiwgcGF0aCwgLi4uYXJncyk7XG4gIH1cblxuICBtb2R1bGVVbmxvYWQobmFtZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiTU9EVUxFXCIsIFwiVU5MT0FEXCIsIG5hbWUpO1xuICB9XG5cbiAgbW9uaXRvcigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJub3Qgc3VwcG9ydGVkIHlldFwiKTtcbiAgfVxuXG4gIG1vdmUoa2V5OiBzdHJpbmcsIGRiOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiTU9WRVwiLCBrZXksIGRiKTtcbiAgfVxuXG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIG1zZXQoLi4ucGFyYW1zOiBhbnlbXSkge1xuICAgIGNvbnN0IGFyZ3M6IFJlZGlzVmFsdWVbXSA9IFtdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHBhcmFtc1swXSkpIHtcbiAgICAgIGFyZ3MucHVzaCguLi5wYXJhbXMuZmxhdE1hcCgoZSkgPT4gZSkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHBhcmFtc1swXSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMocGFyYW1zWzBdKSkge1xuICAgICAgICBhcmdzLnB1c2goa2V5LCB2YWx1ZSBhcyBSZWRpc1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYXJncy5wdXNoKC4uLnBhcmFtcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIk1TRVRcIiwgLi4uYXJncyk7XG4gIH1cblxuICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICBtc2V0bngoLi4ucGFyYW1zOiBhbnlbXSkge1xuICAgIGNvbnN0IGFyZ3M6IFJlZGlzVmFsdWVbXSA9IFtdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHBhcmFtc1swXSkpIHtcbiAgICAgIGFyZ3MucHVzaCguLi5wYXJhbXMuZmxhdE1hcCgoZSkgPT4gZSkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHBhcmFtc1swXSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMocGFyYW1zWzBdKSkge1xuICAgICAgICBhcmdzLnB1c2goa2V5LCB2YWx1ZSBhcyBSZWRpc1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYXJncy5wdXNoKC4uLnBhcmFtcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJNU0VUTlhcIiwgLi4uYXJncyk7XG4gIH1cblxuICBtdWx0aSgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJNVUxUSVwiKTtcbiAgfVxuXG4gIG9iamVjdEVuY29kaW5nKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseShcIk9CSkVDVFwiLCBcIkVOQ09ESU5HXCIsIGtleSk7XG4gIH1cblxuICBvYmplY3RGcmVxKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJPck5pbFJlcGx5KFwiT0JKRUNUXCIsIFwiRlJFUVwiLCBrZXkpO1xuICB9XG5cbiAgb2JqZWN0SGVscCgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIk9CSkVDVFwiLCBcIkhFTFBcIik7XG4gIH1cblxuICBvYmplY3RJZGxldGltZShrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyT3JOaWxSZXBseShcIk9CSkVDVFwiLCBcIklETEVUSU1FXCIsIGtleSk7XG4gIH1cblxuICBvYmplY3RSZWZDb3VudChrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyT3JOaWxSZXBseShcIk9CSkVDVFwiLCBcIlJFRkNPVU5UXCIsIGtleSk7XG4gIH1cblxuICBwZXJzaXN0KGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIlBFUlNJU1RcIiwga2V5KTtcbiAgfVxuXG4gIHBleHBpcmUoa2V5OiBzdHJpbmcsIG1pbGxpc2Vjb25kczogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIlBFWFBJUkVcIiwga2V5LCBtaWxsaXNlY29uZHMpO1xuICB9XG5cbiAgcGV4cGlyZWF0KGtleTogc3RyaW5nLCBtaWxsaXNlY29uZHNUaW1lc3RhbXA6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJQRVhQSVJFQVRcIiwga2V5LCBtaWxsaXNlY29uZHNUaW1lc3RhbXApO1xuICB9XG5cbiAgcGZhZGQoa2V5OiBzdHJpbmcsIC4uLmVsZW1lbnRzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJQRkFERFwiLCBrZXksIC4uLmVsZW1lbnRzKTtcbiAgfVxuXG4gIHBmY291bnQoLi4ua2V5czogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiUEZDT1VOVFwiLCAuLi5rZXlzKTtcbiAgfVxuXG4gIHBmbWVyZ2UoZGVzdGtleTogc3RyaW5nLCAuLi5zb3VyY2VrZXlzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIlBGTUVSR0VcIiwgZGVzdGtleSwgLi4uc291cmNla2V5cyk7XG4gIH1cblxuICBwaW5nKG1lc3NhZ2U/OiBSZWRpc1ZhbHVlKSB7XG4gICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4ZWNCdWxrUmVwbHk8QnVsa1N0cmluZz4oXCJQSU5HXCIsIG1lc3NhZ2UpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJQSU5HXCIpO1xuICB9XG5cbiAgcHNldGV4KGtleTogc3RyaW5nLCBtaWxsaXNlY29uZHM6IG51bWJlciwgdmFsdWU6IFJlZGlzVmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJQU0VURVhcIiwga2V5LCBtaWxsaXNlY29uZHMsIHZhbHVlKTtcbiAgfVxuXG4gIHB1Ymxpc2goY2hhbm5lbDogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiUFVCTElTSFwiLCBjaGFubmVsLCBtZXNzYWdlKTtcbiAgfVxuXG4gIHN1YnNjcmliZTxUTWVzc2FnZSBleHRlbmRzIHN0cmluZyB8IHN0cmluZ1tdID0gc3RyaW5nPihcbiAgICAuLi5jaGFubmVsczogc3RyaW5nW11cbiAgKSB7XG4gICAgcmV0dXJuIHN1YnNjcmliZTxUTWVzc2FnZT4odGhpcy5leGVjdXRvciwgLi4uY2hhbm5lbHMpO1xuICB9XG5cbiAgcHN1YnNjcmliZTxUTWVzc2FnZSBleHRlbmRzIHN0cmluZyB8IHN0cmluZ1tdID0gc3RyaW5nPihcbiAgICAuLi5wYXR0ZXJuczogc3RyaW5nW11cbiAgKSB7XG4gICAgcmV0dXJuIHBzdWJzY3JpYmU8VE1lc3NhZ2U+KHRoaXMuZXhlY3V0b3IsIC4uLnBhdHRlcm5zKTtcbiAgfVxuXG4gIHB1YnN1YkNoYW5uZWxzKHBhdHRlcm4/OiBzdHJpbmcpIHtcbiAgICBpZiAocGF0dGVybiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIlBVQlNVQlwiLCBcIkNIQU5ORUxTXCIsIHBhdHRlcm4pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIlBVQlNVQlwiLCBcIkNIQU5ORUxTXCIpO1xuICB9XG5cbiAgcHVic3ViTnVtcGF0KCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJQVUJTVUJcIiwgXCJOVU1QQVRcIik7XG4gIH1cblxuICBwdWJzdWJOdW1zdWIoLi4uY2hhbm5lbHM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZyB8IEludGVnZXI+KFxuICAgICAgXCJQVUJTVUJcIixcbiAgICAgIFwiTlVNU1VCXCIsXG4gICAgICAuLi5jaGFubmVscyxcbiAgICApO1xuICB9XG5cbiAgcHR0bChrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJQVFRMXCIsIGtleSk7XG4gIH1cblxuICBxdWl0KCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIlFVSVRcIikuZmluYWxseSgoKSA9PiB0aGlzLmNsb3NlKCkpO1xuICB9XG5cbiAgcmFuZG9ta2V5KCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNCdWxrUmVwbHkoXCJSQU5ET01LRVlcIik7XG4gIH1cblxuICByZWFkb25seSgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJSRUFET05MWVwiKTtcbiAgfVxuXG4gIHJlYWR3cml0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJSRUFEV1JJVEVcIik7XG4gIH1cblxuICByZW5hbWUoa2V5OiBzdHJpbmcsIG5ld2tleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiUkVOQU1FXCIsIGtleSwgbmV3a2V5KTtcbiAgfVxuXG4gIHJlbmFtZW54KGtleTogc3RyaW5nLCBuZXdrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJSRU5BTUVOWFwiLCBrZXksIG5ld2tleSk7XG4gIH1cblxuICByZXN0b3JlKFxuICAgIGtleTogc3RyaW5nLFxuICAgIHR0bDogbnVtYmVyLFxuICAgIHNlcmlhbGl6ZWRWYWx1ZTogQmluYXJ5LFxuICAgIG9wdHM/OiBSZXN0b3JlT3B0cyxcbiAgKSB7XG4gICAgY29uc3QgYXJncyA9IFtrZXksIHR0bCwgc2VyaWFsaXplZFZhbHVlXTtcbiAgICBpZiAob3B0cz8ucmVwbGFjZSkge1xuICAgICAgYXJncy5wdXNoKFwiUkVQTEFDRVwiKTtcbiAgICB9XG4gICAgaWYgKG9wdHM/LmFic3R0bCkge1xuICAgICAgYXJncy5wdXNoKFwiQUJTVFRMXCIpO1xuICAgIH1cbiAgICBpZiAob3B0cz8uaWRsZXRpbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXJncy5wdXNoKFwiSURMRVRJTUVcIiwgb3B0cy5pZGxldGltZSk7XG4gICAgfVxuICAgIGlmIChvcHRzPy5mcmVxICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFyZ3MucHVzaChcIkZSRVFcIiwgb3B0cy5mcmVxKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiUkVTVE9SRVwiLCAuLi5hcmdzKTtcbiAgfVxuXG4gIHJvbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHkoXCJST0xFXCIpIGFzIFByb21pc2U8XG4gICAgICB8IFtcIm1hc3RlclwiLCBJbnRlZ2VyLCBCdWxrU3RyaW5nW11bXV1cbiAgICAgIHwgW1wic2xhdmVcIiwgQnVsa1N0cmluZywgSW50ZWdlciwgQnVsa1N0cmluZywgSW50ZWdlcl1cbiAgICAgIHwgW1wic2VudGluZWxcIiwgQnVsa1N0cmluZ1tdXVxuICAgID47XG4gIH1cblxuICBycG9wKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseShcIlJQT1BcIiwga2V5KTtcbiAgfVxuXG4gIHJwb3BscHVzaChzb3VyY2U6IHN0cmluZywgZGVzdGluYXRpb246IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNCdWxrUmVwbHkoXCJSUE9QTFBVU0hcIiwgc291cmNlLCBkZXN0aW5hdGlvbik7XG4gIH1cblxuICBycHVzaChrZXk6IHN0cmluZywgLi4uZWxlbWVudHM6IFJlZGlzVmFsdWVbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJSUFVTSFwiLCBrZXksIC4uLmVsZW1lbnRzKTtcbiAgfVxuXG4gIHJwdXNoeChrZXk6IHN0cmluZywgLi4uZWxlbWVudHM6IFJlZGlzVmFsdWVbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJSUFVTSFhcIiwga2V5LCAuLi5lbGVtZW50cyk7XG4gIH1cblxuICBzYWRkKGtleTogc3RyaW5nLCAuLi5tZW1iZXJzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJTQUREXCIsIGtleSwgLi4ubWVtYmVycyk7XG4gIH1cblxuICBzYXZlKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIlNBVkVcIik7XG4gIH1cblxuICBzY2FyZChrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJTQ0FSRFwiLCBrZXkpO1xuICB9XG5cbiAgc2NyaXB0RGVidWcobW9kZTogU2NyaXB0RGVidWdNb2RlKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiU0NSSVBUXCIsIFwiREVCVUdcIiwgbW9kZSk7XG4gIH1cblxuICBzY3JpcHRFeGlzdHMoLi4uc2hhMXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8SW50ZWdlcj4oXCJTQ1JJUFRcIiwgXCJFWElTVFNcIiwgLi4uc2hhMXMpO1xuICB9XG5cbiAgc2NyaXB0Rmx1c2goKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiU0NSSVBUXCIsIFwiRkxVU0hcIik7XG4gIH1cblxuICBzY3JpcHRLaWxsKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIlNDUklQVFwiLCBcIktJTExcIik7XG4gIH1cblxuICBzY3JpcHRMb2FkKHNjcmlwdDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiU0NSSVBUXCIsIFwiTE9BRFwiLCBzY3JpcHQpO1xuICB9XG5cbiAgc2RpZmYoLi4ua2V5czogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIlNESUZGXCIsIC4uLmtleXMpO1xuICB9XG5cbiAgc2RpZmZzdG9yZShkZXN0aW5hdGlvbjogc3RyaW5nLCAuLi5rZXlzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJTRElGRlNUT1JFXCIsIGRlc3RpbmF0aW9uLCAuLi5rZXlzKTtcbiAgfVxuXG4gIHNlbGVjdChpbmRleDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiU0VMRUNUXCIsIGluZGV4KTtcbiAgfVxuXG4gIHNldChcbiAgICBrZXk6IHN0cmluZyxcbiAgICB2YWx1ZTogUmVkaXNWYWx1ZSxcbiAgICBvcHRzPzogU2V0T3B0cyxcbiAgKTogUHJvbWlzZTxTaW1wbGVTdHJpbmc+O1xuICBzZXQoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsdWU6IFJlZGlzVmFsdWUsXG4gICAgb3B0cz86IFNldFdpdGhNb2RlT3B0cyxcbiAgKTogUHJvbWlzZTxTaW1wbGVTdHJpbmcgfCBCdWxrTmlsPjtcbiAgc2V0KFxuICAgIGtleTogc3RyaW5nLFxuICAgIHZhbHVlOiBSZWRpc1ZhbHVlLFxuICAgIG9wdHM/OiBTZXRPcHRzIHwgU2V0V2l0aE1vZGVPcHRzLFxuICApIHtcbiAgICBjb25zdCBhcmdzOiBSZWRpc1ZhbHVlW10gPSBba2V5LCB2YWx1ZV07XG4gICAgaWYgKG9wdHM/LmV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFyZ3MucHVzaChcIkVYXCIsIG9wdHMuZXgpO1xuICAgIH0gZWxzZSBpZiAob3B0cz8ucHggIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXJncy5wdXNoKFwiUFhcIiwgb3B0cy5weCk7XG4gICAgfVxuICAgIGlmIChvcHRzPy5rZWVwdHRsKSB7XG4gICAgICBhcmdzLnB1c2goXCJLRUVQVFRMXCIpO1xuICAgIH1cbiAgICBpZiAoKG9wdHMgYXMgU2V0V2l0aE1vZGVPcHRzKT8ubW9kZSkge1xuICAgICAgYXJncy5wdXNoKChvcHRzIGFzIFNldFdpdGhNb2RlT3B0cykubW9kZSk7XG4gICAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzT3JOaWxSZXBseShcIlNFVFwiLCAuLi5hcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiU0VUXCIsIC4uLmFyZ3MpO1xuICB9XG5cbiAgc2V0Yml0KGtleTogc3RyaW5nLCBvZmZzZXQ6IG51bWJlciwgdmFsdWU6IFJlZGlzVmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiU0VUQklUXCIsIGtleSwgb2Zmc2V0LCB2YWx1ZSk7XG4gIH1cblxuICBzZXRleChrZXk6IHN0cmluZywgc2Vjb25kczogbnVtYmVyLCB2YWx1ZTogUmVkaXNWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIlNFVEVYXCIsIGtleSwgc2Vjb25kcywgdmFsdWUpO1xuICB9XG5cbiAgc2V0bngoa2V5OiBzdHJpbmcsIHZhbHVlOiBSZWRpc1ZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIlNFVE5YXCIsIGtleSwgdmFsdWUpO1xuICB9XG5cbiAgc2V0cmFuZ2Uoa2V5OiBzdHJpbmcsIG9mZnNldDogbnVtYmVyLCB2YWx1ZTogUmVkaXNWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJTRVRSQU5HRVwiLCBrZXksIG9mZnNldCwgdmFsdWUpO1xuICB9XG5cbiAgc2h1dGRvd24obW9kZT86IFNodXRkb3duTW9kZSkge1xuICAgIGlmIChtb2RlKSB7XG4gICAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJTSFVURE9XTlwiLCBtb2RlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiU0hVVERPV05cIik7XG4gIH1cblxuICBzaW50ZXIoLi4ua2V5czogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIlNJTlRFUlwiLCAuLi5rZXlzKTtcbiAgfVxuXG4gIHNpbnRlcnN0b3JlKGRlc3RpbmF0aW9uOiBzdHJpbmcsIC4uLmtleXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIlNJTlRFUlNUT1JFXCIsIGRlc3RpbmF0aW9uLCAuLi5rZXlzKTtcbiAgfVxuXG4gIHNpc21lbWJlcihrZXk6IHN0cmluZywgbWVtYmVyOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiU0lTTUVNQkVSXCIsIGtleSwgbWVtYmVyKTtcbiAgfVxuXG4gIHNsYXZlb2YoaG9zdDogc3RyaW5nLCBwb3J0OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJTTEFWRU9GXCIsIGhvc3QsIHBvcnQpO1xuICB9XG5cbiAgc2xhdmVvZk5vT25lKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIlNMQVZFT0ZcIiwgXCJOTyBPTkVcIik7XG4gIH1cblxuICByZXBsaWNhb2YoaG9zdDogc3RyaW5nLCBwb3J0OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJSRVBMSUNBT0ZcIiwgaG9zdCwgcG9ydCk7XG4gIH1cblxuICByZXBsaWNhb2ZOb09uZSgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJSRVBMSUNBT0ZcIiwgXCJOTyBPTkVcIik7XG4gIH1cblxuICBzbG93bG9nKHN1YmNvbW1hbmQ6IHN0cmluZywgLi4uYXJnczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseShcIlNMT1dMT0dcIiwgc3ViY29tbWFuZCwgLi4uYXJncyk7XG4gIH1cblxuICBzbWVtYmVycyhrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEJ1bGtTdHJpbmc+KFwiU01FTUJFUlNcIiwga2V5KTtcbiAgfVxuXG4gIHNtb3ZlKHNvdXJjZTogc3RyaW5nLCBkZXN0aW5hdGlvbjogc3RyaW5nLCBtZW1iZXI6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJTTU9WRVwiLCBzb3VyY2UsIGRlc3RpbmF0aW9uLCBtZW1iZXIpO1xuICB9XG5cbiAgc29ydChcbiAgICBrZXk6IHN0cmluZyxcbiAgICBvcHRzPzogU29ydE9wdHMsXG4gICk6IFByb21pc2U8QnVsa1N0cmluZ1tdPjtcbiAgc29ydChcbiAgICBrZXk6IHN0cmluZyxcbiAgICBvcHRzPzogU29ydFdpdGhEZXN0aW5hdGlvbk9wdHMsXG4gICk6IFByb21pc2U8SW50ZWdlcj47XG4gIHNvcnQoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgb3B0cz86IFNvcnRPcHRzIHwgU29ydFdpdGhEZXN0aW5hdGlvbk9wdHMsXG4gICkge1xuICAgIGNvbnN0IGFyZ3M6IChudW1iZXIgfCBzdHJpbmcpW10gPSBba2V5XTtcbiAgICBpZiAob3B0cz8uYnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXJncy5wdXNoKFwiQllcIiwgb3B0cy5ieSk7XG4gICAgfVxuICAgIGlmIChvcHRzPy5saW1pdCkge1xuICAgICAgYXJncy5wdXNoKFwiTElNSVRcIiwgb3B0cy5saW1pdC5vZmZzZXQsIG9wdHMubGltaXQuY291bnQpO1xuICAgIH1cbiAgICBpZiAob3B0cz8ucGF0dGVybnMpIHtcbiAgICAgIGFyZ3MucHVzaCguLi5vcHRzLnBhdHRlcm5zLmZsYXRNYXAoKHBhdHRlcm4pID0+IFtcIkdFVFwiLCBwYXR0ZXJuXSkpO1xuICAgIH1cbiAgICBpZiAob3B0cz8ub3JkZXIpIHtcbiAgICAgIGFyZ3MucHVzaChvcHRzLm9yZGVyKTtcbiAgICB9XG4gICAgaWYgKG9wdHM/LmFscGhhKSB7XG4gICAgICBhcmdzLnB1c2goXCJBTFBIQVwiKTtcbiAgICB9XG4gICAgaWYgKChvcHRzIGFzIFNvcnRXaXRoRGVzdGluYXRpb25PcHRzKT8uZGVzdGluYXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXJncy5wdXNoKFwiU1RPUkVcIiwgKG9wdHMgYXMgU29ydFdpdGhEZXN0aW5hdGlvbk9wdHMpLmRlc3RpbmF0aW9uKTtcbiAgICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJTT1JUXCIsIC4uLmFyZ3MpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIlNPUlRcIiwgLi4uYXJncyk7XG4gIH1cblxuICBzcG9wKGtleTogc3RyaW5nKTogUHJvbWlzZTxCdWxrPjtcbiAgc3BvcChrZXk6IHN0cmluZywgY291bnQ6IG51bWJlcik6IFByb21pc2U8QnVsa1N0cmluZ1tdPjtcbiAgc3BvcChrZXk6IHN0cmluZywgY291bnQ/OiBudW1iZXIpIHtcbiAgICBpZiAoY291bnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJTUE9QXCIsIGtleSwgY291bnQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjQnVsa1JlcGx5KFwiU1BPUFwiLCBrZXkpO1xuICB9XG5cbiAgc3JhbmRtZW1iZXIoa2V5OiBzdHJpbmcpOiBQcm9taXNlPEJ1bGs+O1xuICBzcmFuZG1lbWJlcihrZXk6IHN0cmluZywgY291bnQ6IG51bWJlcik6IFByb21pc2U8QnVsa1N0cmluZ1tdPjtcbiAgc3JhbmRtZW1iZXIoa2V5OiBzdHJpbmcsIGNvdW50PzogbnVtYmVyKSB7XG4gICAgaWYgKGNvdW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEJ1bGtTdHJpbmc+KFwiU1JBTkRNRU1CRVJcIiwga2V5LCBjb3VudCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNCdWxrUmVwbHkoXCJTUkFORE1FTUJFUlwiLCBrZXkpO1xuICB9XG5cbiAgc3JlbShrZXk6IHN0cmluZywgLi4ubWVtYmVyczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiU1JFTVwiLCBrZXksIC4uLm1lbWJlcnMpO1xuICB9XG5cbiAgc3RyYWxnbyhcbiAgICBhbGdvcml0aG06IFN0cmFsZ29BbGdvcml0aG0sXG4gICAgdGFyZ2V0OiBTdHJhbGdvVGFyZ2V0LFxuICAgIGE6IHN0cmluZyxcbiAgICBiOiBzdHJpbmcsXG4gICk6IFByb21pc2U8QnVsaz47XG5cbiAgc3RyYWxnbyhcbiAgICBhbGdvcml0aG06IFN0cmFsZ29BbGdvcml0aG0sXG4gICAgdGFyZ2V0OiBTdHJhbGdvVGFyZ2V0LFxuICAgIGE6IHN0cmluZyxcbiAgICBiOiBzdHJpbmcsXG4gICAgb3B0cz86IHsgbGVuOiB0cnVlIH0sXG4gICk6IFByb21pc2U8SW50ZWdlcj47XG5cbiAgc3RyYWxnbyhcbiAgICBhbGdvcml0aG06IFN0cmFsZ29BbGdvcml0aG0sXG4gICAgdGFyZ2V0OiBTdHJhbGdvVGFyZ2V0LFxuICAgIGE6IHN0cmluZyxcbiAgICBiOiBzdHJpbmcsXG4gICAgb3B0cz86IHsgaWR4OiB0cnVlIH0sXG4gICk6IFByb21pc2U8XG4gICAgW1xuICAgICAgc3RyaW5nLCAvL2BcIm1hdGNoZXNcImBcbiAgICAgIEFycmF5PFtbbnVtYmVyLCBudW1iZXJdLCBbbnVtYmVyLCBudW1iZXJdXT4sXG4gICAgICBzdHJpbmcsIC8vIGBcImxlblwiYFxuICAgICAgSW50ZWdlcixcbiAgICBdXG4gID47XG5cbiAgc3RyYWxnbyhcbiAgICBhbGdvcml0aG06IFN0cmFsZ29BbGdvcml0aG0sXG4gICAgdGFyZ2V0OiBTdHJhbGdvVGFyZ2V0LFxuICAgIGE6IHN0cmluZyxcbiAgICBiOiBzdHJpbmcsXG4gICAgb3B0cz86IHsgaWR4OiB0cnVlOyB3aXRobWF0Y2hsZW46IHRydWUgfSxcbiAgKTogUHJvbWlzZTxcbiAgICBbXG4gICAgICBzdHJpbmcsIC8vIGBcIm1hdGNoZXNcImBcbiAgICAgIEFycmF5PFtbbnVtYmVyLCBudW1iZXJdLCBbbnVtYmVyLCBudW1iZXJdLCBudW1iZXJdPixcbiAgICAgIHN0cmluZywgLy8gYFwibGVuXCJgXG4gICAgICBJbnRlZ2VyLFxuICAgIF1cbiAgPjtcblxuICBzdHJhbGdvKFxuICAgIGFsZ29yaXRobTogU3RyYWxnb0FsZ29yaXRobSxcbiAgICB0YXJnZXQ6IFN0cmFsZ29UYXJnZXQsXG4gICAgYTogc3RyaW5nLFxuICAgIGI6IHN0cmluZyxcbiAgICBvcHRzPzogU3RyYWxnb09wdHMsXG4gICkge1xuICAgIGNvbnN0IGFyZ3M6IChudW1iZXIgfCBzdHJpbmcpW10gPSBbXTtcbiAgICBpZiAob3B0cz8uaWR4KSB7XG4gICAgICBhcmdzLnB1c2goXCJJRFhcIik7XG4gICAgfVxuICAgIGlmIChvcHRzPy5sZW4pIHtcbiAgICAgIGFyZ3MucHVzaChcIkxFTlwiKTtcbiAgICB9XG4gICAgaWYgKG9wdHM/LndpdGhtYXRjaGxlbikge1xuICAgICAgYXJncy5wdXNoKFwiV0lUSE1BVENITEVOXCIpO1xuICAgIH1cbiAgICBpZiAob3B0cz8ubWlubWF0Y2hsZW4pIHtcbiAgICAgIGFyZ3MucHVzaChcIk1JTk1BVENITEVOXCIpO1xuICAgICAgYXJncy5wdXNoKG9wdHMubWlubWF0Y2hsZW4pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjUmVwbHk8QnVsayB8IEludGVnZXIgfCBDb25kaXRpb25hbEFycmF5PihcbiAgICAgIFwiU1RSQUxHT1wiLFxuICAgICAgYWxnb3JpdGhtLFxuICAgICAgdGFyZ2V0LFxuICAgICAgYSxcbiAgICAgIGIsXG4gICAgICAuLi5hcmdzLFxuICAgICk7XG4gIH1cblxuICBzdHJsZW4oa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiU1RSTEVOXCIsIGtleSk7XG4gIH1cblxuICBzdW5pb24oLi4ua2V5czogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIlNVTklPTlwiLCAuLi5rZXlzKTtcbiAgfVxuXG4gIHN1bmlvbnN0b3JlKGRlc3RpbmF0aW9uOiBzdHJpbmcsIC4uLmtleXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIlNVTklPTlNUT1JFXCIsIGRlc3RpbmF0aW9uLCAuLi5rZXlzKTtcbiAgfVxuXG4gIHN3YXBkYihpbmRleDE6IG51bWJlciwgaW5kZXgyOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJTV0FQREJcIiwgaW5kZXgxLCBpbmRleDIpO1xuICB9XG5cbiAgc3luYygpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJub3QgaW1wbGVtZW50ZWRcIik7XG4gIH1cblxuICB0aW1lKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5KFwiVElNRVwiKSBhcyBQcm9taXNlPFtCdWxrU3RyaW5nLCBCdWxrU3RyaW5nXT47XG4gIH1cblxuICB0b3VjaCguLi5rZXlzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJUT1VDSFwiLCAuLi5rZXlzKTtcbiAgfVxuXG4gIHR0bChrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJUVExcIiwga2V5KTtcbiAgfVxuXG4gIHR5cGUoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJUWVBFXCIsIGtleSk7XG4gIH1cblxuICB1bmxpbmsoLi4ua2V5czogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiVU5MSU5LXCIsIC4uLmtleXMpO1xuICB9XG5cbiAgdW53YXRjaCgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJVTldBVENIXCIpO1xuICB9XG5cbiAgd2FpdChudW1yZXBsaWNhczogbnVtYmVyLCB0aW1lb3V0OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiV0FJVFwiLCBudW1yZXBsaWNhcywgdGltZW91dCk7XG4gIH1cblxuICB3YXRjaCguLi5rZXlzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIldBVENIXCIsIC4uLmtleXMpO1xuICB9XG5cbiAgeGFjayhrZXk6IHN0cmluZywgZ3JvdXA6IHN0cmluZywgLi4ueGlkczogWElkSW5wdXRbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXG4gICAgICBcIlhBQ0tcIixcbiAgICAgIGtleSxcbiAgICAgIGdyb3VwLFxuICAgICAgLi4ueGlkcy5tYXAoKHhpZCkgPT4geGlkc3RyKHhpZCkpLFxuICAgICk7XG4gIH1cblxuICB4YWRkKFxuICAgIGtleTogc3RyaW5nLFxuICAgIHhpZDogWElkQWRkLFxuICAgIGZpZWxkVmFsdWVzOiBYQWRkRmllbGRWYWx1ZXMsXG4gICAgbWF4bGVuOiBYTWF4bGVuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkLFxuICApIHtcbiAgICBjb25zdCBhcmdzOiBSZWRpc1ZhbHVlW10gPSBba2V5XTtcblxuICAgIGlmIChtYXhsZW4pIHtcbiAgICAgIGFyZ3MucHVzaChcIk1BWExFTlwiKTtcbiAgICAgIGlmIChtYXhsZW4uYXBwcm94KSB7XG4gICAgICAgIGFyZ3MucHVzaChcIn5cIik7XG4gICAgICB9XG4gICAgICBhcmdzLnB1c2gobWF4bGVuLmVsZW1lbnRzLnRvU3RyaW5nKCkpO1xuICAgIH1cblxuICAgIGFyZ3MucHVzaCh4aWRzdHIoeGlkKSk7XG5cbiAgICBpZiAoZmllbGRWYWx1ZXMgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgIGZvciAoY29uc3QgW2YsIHZdIG9mIGZpZWxkVmFsdWVzKSB7XG4gICAgICAgIGFyZ3MucHVzaChmKTtcbiAgICAgICAgYXJncy5wdXNoKHYpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGNvbnN0IFtmLCB2XSBvZiBPYmplY3QuZW50cmllcyhmaWVsZFZhbHVlcykpIHtcbiAgICAgICAgYXJncy5wdXNoKGYpO1xuICAgICAgICBhcmdzLnB1c2godik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseTxCdWxrU3RyaW5nPihcbiAgICAgIFwiWEFERFwiLFxuICAgICAgLi4uYXJncyxcbiAgICApLnRoZW4oKHJhd0lkKSA9PiBwYXJzZVhJZChyYXdJZCkpO1xuICB9XG5cbiAgeGNsYWltKGtleTogc3RyaW5nLCBvcHRzOiBYQ2xhaW1PcHRzLCAuLi54aWRzOiBYSWRJbnB1dFtdKSB7XG4gICAgY29uc3QgYXJncyA9IFtdO1xuICAgIGlmIChvcHRzLmlkbGUpIHtcbiAgICAgIGFyZ3MucHVzaChcIklETEVcIik7XG4gICAgICBhcmdzLnB1c2gob3B0cy5pZGxlKTtcbiAgICB9XG5cbiAgICBpZiAob3B0cy50aW1lKSB7XG4gICAgICBhcmdzLnB1c2goXCJUSU1FXCIpO1xuICAgICAgYXJncy5wdXNoKG9wdHMudGltZSk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMucmV0cnlDb3VudCkge1xuICAgICAgYXJncy5wdXNoKFwiUkVUUllDT1VOVFwiKTtcbiAgICAgIGFyZ3MucHVzaChvcHRzLnJldHJ5Q291bnQpO1xuICAgIH1cblxuICAgIGlmIChvcHRzLmZvcmNlKSB7XG4gICAgICBhcmdzLnB1c2goXCJGT1JDRVwiKTtcbiAgICB9XG5cbiAgICBpZiAob3B0cy5qdXN0WElkKSB7XG4gICAgICBhcmdzLnB1c2goXCJKVVNUSURcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8WFJlYWRJZERhdGEgfCBCdWxrU3RyaW5nPihcbiAgICAgIFwiWENMQUlNXCIsXG4gICAgICBrZXksXG4gICAgICBvcHRzLmdyb3VwLFxuICAgICAgb3B0cy5jb25zdW1lcixcbiAgICAgIG9wdHMubWluSWRsZVRpbWUsXG4gICAgICAuLi54aWRzLm1hcCgoeGlkKSA9PiB4aWRzdHIoeGlkKSksXG4gICAgICAuLi5hcmdzLFxuICAgICkudGhlbigocmF3KSA9PiB7XG4gICAgICBpZiAob3B0cy5qdXN0WElkKSB7XG4gICAgICAgIGNvbnN0IHhpZHMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCByIG9mIHJhdykge1xuICAgICAgICAgIGlmICh0eXBlb2YgciA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgeGlkcy5wdXNoKHBhcnNlWElkKHIpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGF5bG9hZDogWENsYWltSnVzdFhJZCA9IHsga2luZDogXCJqdXN0eGlkXCIsIHhpZHMgfTtcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gW107XG4gICAgICBmb3IgKGNvbnN0IHIgb2YgcmF3KSB7XG4gICAgICAgIGlmICh0eXBlb2YgciAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgIG1lc3NhZ2VzLnB1c2gocGFyc2VYTWVzc2FnZShyKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IHBheWxvYWQ6IFhDbGFpbU1lc3NhZ2VzID0geyBraW5kOiBcIm1lc3NhZ2VzXCIsIG1lc3NhZ2VzIH07XG4gICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICB9KTtcbiAgfVxuXG4gIHhkZWwoa2V5OiBzdHJpbmcsIC4uLnhpZHM6IFhJZElucHV0W10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFxuICAgICAgXCJYREVMXCIsXG4gICAgICBrZXksXG4gICAgICAuLi54aWRzLm1hcCgocmF3SWQpID0+IHhpZHN0cihyYXdJZCkpLFxuICAgICk7XG4gIH1cblxuICB4bGVuKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIlhMRU5cIiwga2V5KTtcbiAgfVxuXG4gIHhncm91cENyZWF0ZShcbiAgICBrZXk6IHN0cmluZyxcbiAgICBncm91cE5hbWU6IHN0cmluZyxcbiAgICB4aWQ6IFhJZElucHV0IHwgXCIkXCIsXG4gICAgbWtzdHJlYW0/OiBib29sZWFuLFxuICApIHtcbiAgICBjb25zdCBhcmdzID0gW107XG4gICAgaWYgKG1rc3RyZWFtKSB7XG4gICAgICBhcmdzLnB1c2goXCJNS1NUUkVBTVwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXG4gICAgICBcIlhHUk9VUFwiLFxuICAgICAgXCJDUkVBVEVcIixcbiAgICAgIGtleSxcbiAgICAgIGdyb3VwTmFtZSxcbiAgICAgIHhpZHN0cih4aWQpLFxuICAgICAgLi4uYXJncyxcbiAgICApO1xuICB9XG5cbiAgeGdyb3VwRGVsQ29uc3VtZXIoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgZ3JvdXBOYW1lOiBzdHJpbmcsXG4gICAgY29uc3VtZXJOYW1lOiBzdHJpbmcsXG4gICkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXG4gICAgICBcIlhHUk9VUFwiLFxuICAgICAgXCJERUxDT05TVU1FUlwiLFxuICAgICAga2V5LFxuICAgICAgZ3JvdXBOYW1lLFxuICAgICAgY29uc3VtZXJOYW1lLFxuICAgICk7XG4gIH1cblxuICB4Z3JvdXBEZXN0cm95KGtleTogc3RyaW5nLCBncm91cE5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJYR1JPVVBcIiwgXCJERVNUUk9ZXCIsIGtleSwgZ3JvdXBOYW1lKTtcbiAgfVxuXG4gIHhncm91cEhlbHAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseTxCdWxrU3RyaW5nPihcIlhHUk9VUFwiLCBcIkhFTFBcIik7XG4gIH1cblxuICB4Z3JvdXBTZXRJRChcbiAgICBrZXk6IHN0cmluZyxcbiAgICBncm91cE5hbWU6IHN0cmluZyxcbiAgICB4aWQ6IFhJZCxcbiAgKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFxuICAgICAgXCJYR1JPVVBcIixcbiAgICAgIFwiU0VUSURcIixcbiAgICAgIGtleSxcbiAgICAgIGdyb3VwTmFtZSxcbiAgICAgIHhpZHN0cih4aWQpLFxuICAgICk7XG4gIH1cblxuICB4aW5mb1N0cmVhbShrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PFJhdz4oXCJYSU5GT1wiLCBcIlNUUkVBTVwiLCBrZXkpLnRoZW4oXG4gICAgICAocmF3KSA9PiB7XG4gICAgICAgIC8vIE5vdGUgdGhhdCB5b3Ugc2hvdWxkIG5vdCByZWx5IG9uIHRoZSBmaWVsZHNcbiAgICAgICAgLy8gZXhhY3QgcG9zaXRpb24sIG5vciBvbiB0aGUgbnVtYmVyIG9mIGZpZWxkcyxcbiAgICAgICAgLy8gbmV3IGZpZWxkcyBtYXkgYmUgYWRkZWQgaW4gdGhlIGZ1dHVyZS5cbiAgICAgICAgY29uc3QgZGF0YTogTWFwPHN0cmluZywgUmF3PiA9IGNvbnZlcnRNYXAocmF3KTtcblxuICAgICAgICBjb25zdCBmaXJzdEVudHJ5ID0gcGFyc2VYTWVzc2FnZShcbiAgICAgICAgICBkYXRhLmdldChcImZpcnN0LWVudHJ5XCIpIGFzIFhSZWFkSWREYXRhLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBsYXN0RW50cnkgPSBwYXJzZVhNZXNzYWdlKFxuICAgICAgICAgIGRhdGEuZ2V0KFwibGFzdC1lbnRyeVwiKSBhcyBYUmVhZElkRGF0YSxcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlbmd0aDogcmF3bnVtKGRhdGEuZ2V0KFwibGVuZ3RoXCIpID8/IG51bGwpLFxuICAgICAgICAgIHJhZGl4VHJlZUtleXM6IHJhd251bShkYXRhLmdldChcInJhZGl4LXRyZWUta2V5c1wiKSA/PyBudWxsKSxcbiAgICAgICAgICByYWRpeFRyZWVOb2RlczogcmF3bnVtKGRhdGEuZ2V0KFwicmFkaXgtdHJlZS1ub2Rlc1wiKSA/PyBudWxsKSxcbiAgICAgICAgICBncm91cHM6IHJhd251bShkYXRhLmdldChcImdyb3Vwc1wiKSA/PyBudWxsKSxcbiAgICAgICAgICBsYXN0R2VuZXJhdGVkSWQ6IHBhcnNlWElkKFxuICAgICAgICAgICAgcmF3c3RyKGRhdGEuZ2V0KFwibGFzdC1nZW5lcmF0ZWQtaWRcIikgPz8gbnVsbCksXG4gICAgICAgICAgKSxcbiAgICAgICAgICBmaXJzdEVudHJ5LFxuICAgICAgICAgIGxhc3RFbnRyeSxcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgKTtcbiAgfVxuXG4gIHhpbmZvU3RyZWFtRnVsbChrZXk6IHN0cmluZywgY291bnQ/OiBudW1iZXIpIHtcbiAgICBjb25zdCBhcmdzID0gW107XG4gICAgaWYgKGNvdW50KSB7XG4gICAgICBhcmdzLnB1c2goXCJDT1VOVFwiKTtcbiAgICAgIGFyZ3MucHVzaChjb3VudCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PFJhdz4oXCJYSU5GT1wiLCBcIlNUUkVBTVwiLCBrZXksIFwiRlVMTFwiLCAuLi5hcmdzKVxuICAgICAgLnRoZW4oXG4gICAgICAgIChyYXcpID0+IHtcbiAgICAgICAgICAvLyBOb3RlIHRoYXQgeW91IHNob3VsZCBub3QgcmVseSBvbiB0aGUgZmllbGRzXG4gICAgICAgICAgLy8gZXhhY3QgcG9zaXRpb24sIG5vciBvbiB0aGUgbnVtYmVyIG9mIGZpZWxkcyxcbiAgICAgICAgICAvLyBuZXcgZmllbGRzIG1heSBiZSBhZGRlZCBpbiB0aGUgZnV0dXJlLlxuICAgICAgICAgIGlmIChyYXcgPT0gbnVsbCkgdGhyb3cgXCJubyBkYXRhXCI7XG5cbiAgICAgICAgICBjb25zdCBkYXRhOiBNYXA8c3RyaW5nLCBSYXc+ID0gY29udmVydE1hcChyYXcpO1xuICAgICAgICAgIGlmIChkYXRhID09PSB1bmRlZmluZWQpIHRocm93IFwibm8gZGF0YSBjb252ZXJ0ZWRcIjtcblxuICAgICAgICAgIGNvbnN0IGVudHJpZXMgPSAoZGF0YS5nZXQoXCJlbnRyaWVzXCIpIGFzIENvbmRpdGlvbmFsQXJyYXkpLm1hcCgoXG4gICAgICAgICAgICByYXc6IFJhdyxcbiAgICAgICAgICApID0+IHBhcnNlWE1lc3NhZ2UocmF3IGFzIFhSZWFkSWREYXRhKSk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlbmd0aDogcmF3bnVtKGRhdGEuZ2V0KFwibGVuZ3RoXCIpID8/IG51bGwpLFxuICAgICAgICAgICAgcmFkaXhUcmVlS2V5czogcmF3bnVtKGRhdGEuZ2V0KFwicmFkaXgtdHJlZS1rZXlzXCIpID8/IG51bGwpLFxuICAgICAgICAgICAgcmFkaXhUcmVlTm9kZXM6IHJhd251bShkYXRhLmdldChcInJhZGl4LXRyZWUtbm9kZXNcIikgPz8gbnVsbCksXG4gICAgICAgICAgICBsYXN0R2VuZXJhdGVkSWQ6IHBhcnNlWElkKFxuICAgICAgICAgICAgICByYXdzdHIoZGF0YS5nZXQoXCJsYXN0LWdlbmVyYXRlZC1pZFwiKSA/PyBudWxsKSxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBlbnRyaWVzLFxuICAgICAgICAgICAgZ3JvdXBzOiBwYXJzZVhHcm91cERldGFpbChkYXRhLmdldChcImdyb3Vwc1wiKSBhcyBDb25kaXRpb25hbEFycmF5KSxcbiAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgKTtcbiAgfVxuXG4gIHhpbmZvR3JvdXBzKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8Q29uZGl0aW9uYWxBcnJheT4oXCJYSU5GT1wiLCBcIkdST1VQU1wiLCBrZXkpLnRoZW4oXG4gICAgICAocmF3cykgPT5cbiAgICAgICAgcmF3cy5tYXAoKHJhdykgPT4ge1xuICAgICAgICAgIGNvbnN0IGRhdGEgPSBjb252ZXJ0TWFwKHJhdyk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWU6IHJhd3N0cihkYXRhLmdldChcIm5hbWVcIikgPz8gbnVsbCksXG4gICAgICAgICAgICBjb25zdW1lcnM6IHJhd251bShkYXRhLmdldChcImNvbnN1bWVyc1wiKSA/PyBudWxsKSxcbiAgICAgICAgICAgIHBlbmRpbmc6IHJhd251bShkYXRhLmdldChcInBlbmRpbmdcIikgPz8gbnVsbCksXG4gICAgICAgICAgICBsYXN0RGVsaXZlcmVkSWQ6IHBhcnNlWElkKFxuICAgICAgICAgICAgICByYXdzdHIoZGF0YS5nZXQoXCJsYXN0LWRlbGl2ZXJlZC1pZFwiKSA/PyBudWxsKSxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIHhpbmZvQ29uc3VtZXJzKGtleTogc3RyaW5nLCBncm91cDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8Q29uZGl0aW9uYWxBcnJheT4oXG4gICAgICBcIlhJTkZPXCIsXG4gICAgICBcIkNPTlNVTUVSU1wiLFxuICAgICAga2V5LFxuICAgICAgZ3JvdXAsXG4gICAgKS50aGVuKFxuICAgICAgKHJhd3MpID0+XG4gICAgICAgIHJhd3MubWFwKChyYXcpID0+IHtcbiAgICAgICAgICBjb25zdCBkYXRhID0gY29udmVydE1hcChyYXcpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiByYXdzdHIoZGF0YS5nZXQoXCJuYW1lXCIpID8/IG51bGwpLFxuICAgICAgICAgICAgcGVuZGluZzogcmF3bnVtKGRhdGEuZ2V0KFwicGVuZGluZ1wiKSA/PyBudWxsKSxcbiAgICAgICAgICAgIGlkbGU6IHJhd251bShkYXRhLmdldChcImlkbGVcIikgPz8gbnVsbCksXG4gICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIHhwZW5kaW5nKFxuICAgIGtleTogc3RyaW5nLFxuICAgIGdyb3VwOiBzdHJpbmcsXG4gICkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PFJhdz4oXCJYUEVORElOR1wiLCBrZXksIGdyb3VwKVxuICAgICAgLnRoZW4oKHJhdykgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgaXNOdW1iZXIocmF3WzBdKSAmJiBpc1N0cmluZyhyYXdbMV0pICYmXG4gICAgICAgICAgaXNTdHJpbmcocmF3WzJdKSAmJiBpc0NvbmRBcnJheShyYXdbM10pXG4gICAgICAgICkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb3VudDogcmF3WzBdLFxuICAgICAgICAgICAgc3RhcnRJZDogcGFyc2VYSWQocmF3WzFdKSxcbiAgICAgICAgICAgIGVuZElkOiBwYXJzZVhJZChyYXdbMl0pLFxuICAgICAgICAgICAgY29uc3VtZXJzOiBwYXJzZVhQZW5kaW5nQ29uc3VtZXJzKHJhd1szXSksXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBcInBhcnNlIGVyclwiO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIHhwZW5kaW5nQ291bnQoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgZ3JvdXA6IHN0cmluZyxcbiAgICBzdGFydEVuZENvdW50OiBTdGFydEVuZENvdW50LFxuICAgIGNvbnN1bWVyPzogc3RyaW5nLFxuICApIHtcbiAgICBjb25zdCBhcmdzID0gW107XG4gICAgYXJncy5wdXNoKHN0YXJ0RW5kQ291bnQuc3RhcnQpO1xuICAgIGFyZ3MucHVzaChzdGFydEVuZENvdW50LmVuZCk7XG4gICAgYXJncy5wdXNoKHN0YXJ0RW5kQ291bnQuY291bnQpO1xuXG4gICAgaWYgKGNvbnN1bWVyKSB7XG4gICAgICBhcmdzLnB1c2goY29uc3VtZXIpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PFJhdz4oXCJYUEVORElOR1wiLCBrZXksIGdyb3VwLCAuLi5hcmdzKVxuICAgICAgLnRoZW4oKHJhdykgPT4gcGFyc2VYUGVuZGluZ0NvdW50cyhyYXcpKTtcbiAgfVxuXG4gIHhyYW5nZShcbiAgICBrZXk6IHN0cmluZyxcbiAgICBzdGFydDogWElkTmVnLFxuICAgIGVuZDogWElkUG9zLFxuICAgIGNvdW50PzogbnVtYmVyLFxuICApIHtcbiAgICBjb25zdCBhcmdzOiAoc3RyaW5nIHwgbnVtYmVyKVtdID0gW2tleSwgeGlkc3RyKHN0YXJ0KSwgeGlkc3RyKGVuZCldO1xuICAgIGlmIChjb3VudCkge1xuICAgICAgYXJncy5wdXNoKFwiQ09VTlRcIik7XG4gICAgICBhcmdzLnB1c2goY291bnQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxYUmVhZElkRGF0YT4oXCJYUkFOR0VcIiwgLi4uYXJncykudGhlbihcbiAgICAgIChyYXcpID0+IHJhdy5tYXAoKG0pID0+IHBhcnNlWE1lc3NhZ2UobSkpLFxuICAgICk7XG4gIH1cblxuICB4cmV2cmFuZ2UoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgc3RhcnQ6IFhJZFBvcyxcbiAgICBlbmQ6IFhJZE5lZyxcbiAgICBjb3VudD86IG51bWJlcixcbiAgKSB7XG4gICAgY29uc3QgYXJnczogKHN0cmluZyB8IG51bWJlcilbXSA9IFtrZXksIHhpZHN0cihzdGFydCksIHhpZHN0cihlbmQpXTtcbiAgICBpZiAoY291bnQpIHtcbiAgICAgIGFyZ3MucHVzaChcIkNPVU5UXCIpO1xuICAgICAgYXJncy5wdXNoKGNvdW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8WFJlYWRJZERhdGE+KFwiWFJFVlJBTkdFXCIsIC4uLmFyZ3MpLnRoZW4oXG4gICAgICAocmF3KSA9PiByYXcubWFwKChtKSA9PiBwYXJzZVhNZXNzYWdlKG0pKSxcbiAgICApO1xuICB9XG5cbiAgeHJlYWQoXG4gICAga2V5WElkczogKFhLZXlJZCB8IFhLZXlJZExpa2UpW10sXG4gICAgb3B0cz86IFhSZWFkT3B0cyxcbiAgKSB7XG4gICAgY29uc3QgYXJncyA9IFtdO1xuICAgIGlmIChvcHRzKSB7XG4gICAgICBpZiAob3B0cy5jb3VudCkge1xuICAgICAgICBhcmdzLnB1c2goXCJDT1VOVFwiKTtcbiAgICAgICAgYXJncy5wdXNoKG9wdHMuY291bnQpO1xuICAgICAgfVxuICAgICAgaWYgKG9wdHMuYmxvY2spIHtcbiAgICAgICAgYXJncy5wdXNoKFwiQkxPQ0tcIik7XG4gICAgICAgIGFyZ3MucHVzaChvcHRzLmJsb2NrKTtcbiAgICAgIH1cbiAgICB9XG4gICAgYXJncy5wdXNoKFwiU1RSRUFNU1wiKTtcblxuICAgIGNvbnN0IHRoZUtleXMgPSBbXTtcbiAgICBjb25zdCB0aGVYSWRzID0gW107XG5cbiAgICBmb3IgKGNvbnN0IGEgb2Yga2V5WElkcykge1xuICAgICAgaWYgKGEgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAvLyBYS2V5SWRMaWtlXG4gICAgICAgIHRoZUtleXMucHVzaChhWzBdKTtcbiAgICAgICAgdGhlWElkcy5wdXNoKHhpZHN0cihhWzFdKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBYS2V5SWRcbiAgICAgICAgdGhlS2V5cy5wdXNoKGEua2V5KTtcbiAgICAgICAgdGhlWElkcy5wdXNoKHhpZHN0cihhLnhpZCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PFhSZWFkU3RyZWFtUmF3PihcbiAgICAgIFwiWFJFQURcIixcbiAgICAgIC4uLmFyZ3MuY29uY2F0KHRoZUtleXMpLmNvbmNhdCh0aGVYSWRzKSxcbiAgICApLnRoZW4oKHJhdykgPT4gcGFyc2VYUmVhZFJlcGx5KHJhdykpO1xuICB9XG5cbiAgeHJlYWRncm91cChcbiAgICBrZXlYSWRzOiAoWEtleUlkR3JvdXAgfCBYS2V5SWRHcm91cExpa2UpW10sXG4gICAgeyBncm91cCwgY29uc3VtZXIsIGNvdW50LCBibG9jayB9OiBYUmVhZEdyb3VwT3B0cyxcbiAgKSB7XG4gICAgY29uc3QgYXJnczogKHN0cmluZyB8IG51bWJlcilbXSA9IFtcbiAgICAgIFwiR1JPVVBcIixcbiAgICAgIGdyb3VwLFxuICAgICAgY29uc3VtZXIsXG4gICAgXTtcblxuICAgIGlmIChjb3VudCkge1xuICAgICAgYXJncy5wdXNoKFwiQ09VTlRcIik7XG4gICAgICBhcmdzLnB1c2goY291bnQpO1xuICAgIH1cbiAgICBpZiAoYmxvY2spIHtcbiAgICAgIGFyZ3MucHVzaChcIkJMT0NLXCIpO1xuICAgICAgYXJncy5wdXNoKGJsb2NrKTtcbiAgICB9XG5cbiAgICBhcmdzLnB1c2goXCJTVFJFQU1TXCIpO1xuXG4gICAgY29uc3QgdGhlS2V5cyA9IFtdO1xuICAgIGNvbnN0IHRoZVhJZHMgPSBbXTtcblxuICAgIGZvciAoY29uc3QgYSBvZiBrZXlYSWRzKSB7XG4gICAgICBpZiAoYSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIC8vIFhLZXlJZEdyb3VwTGlrZVxuICAgICAgICB0aGVLZXlzLnB1c2goYVswXSk7XG4gICAgICAgIHRoZVhJZHMucHVzaChhWzFdID09PSBcIj5cIiA/IFwiPlwiIDogeGlkc3RyKGFbMV0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFhLZXlJZEdyb3VwXG4gICAgICAgIHRoZUtleXMucHVzaChhLmtleSk7XG4gICAgICAgIHRoZVhJZHMucHVzaChhLnhpZCA9PT0gXCI+XCIgPyBcIj5cIiA6IHhpZHN0cihhLnhpZCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PFhSZWFkU3RyZWFtUmF3PihcbiAgICAgIFwiWFJFQURHUk9VUFwiLFxuICAgICAgLi4uYXJncy5jb25jYXQodGhlS2V5cykuY29uY2F0KHRoZVhJZHMpLFxuICAgICkudGhlbigocmF3KSA9PiBwYXJzZVhSZWFkUmVwbHkocmF3KSk7XG4gIH1cblxuICB4dHJpbShrZXk6IHN0cmluZywgbWF4bGVuOiBYTWF4bGVuKSB7XG4gICAgY29uc3QgYXJncyA9IFtdO1xuICAgIGlmIChtYXhsZW4uYXBwcm94KSB7XG4gICAgICBhcmdzLnB1c2goXCJ+XCIpO1xuICAgIH1cblxuICAgIGFyZ3MucHVzaChtYXhsZW4uZWxlbWVudHMpO1xuXG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIlhUUklNXCIsIGtleSwgXCJNQVhMRU5cIiwgLi4uYXJncyk7XG4gIH1cblxuICB6YWRkKFxuICAgIGtleTogc3RyaW5nLFxuICAgIHNjb3JlOiBudW1iZXIsXG4gICAgbWVtYmVyOiBzdHJpbmcsXG4gICAgb3B0cz86IFpBZGRPcHRzLFxuICApOiBQcm9taXNlPEludGVnZXI+O1xuICB6YWRkKFxuICAgIGtleTogc3RyaW5nLFxuICAgIHNjb3JlTWVtYmVyczogW251bWJlciwgc3RyaW5nXVtdLFxuICAgIG9wdHM/OiBaQWRkT3B0cyxcbiAgKTogUHJvbWlzZTxJbnRlZ2VyPjtcbiAgemFkZChcbiAgICBrZXk6IHN0cmluZyxcbiAgICBtZW1iZXJTY29yZXM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4sXG4gICAgb3B0cz86IFpBZGRPcHRzLFxuICApOiBQcm9taXNlPEludGVnZXI+O1xuICB6YWRkKFxuICAgIGtleTogc3RyaW5nLFxuICAgIHBhcmFtMTogbnVtYmVyIHwgW251bWJlciwgc3RyaW5nXVtdIHwgUmVjb3JkPHN0cmluZywgbnVtYmVyPixcbiAgICBwYXJhbTI/OiBzdHJpbmcgfCBaQWRkT3B0cyxcbiAgICBvcHRzPzogWkFkZE9wdHMsXG4gICkge1xuICAgIGNvbnN0IGFyZ3M6IChzdHJpbmcgfCBudW1iZXIpW10gPSBba2V5XTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShwYXJhbTEpKSB7XG4gICAgICB0aGlzLnB1c2haQWRkT3B0cyhhcmdzLCBwYXJhbTIgYXMgWkFkZE9wdHMpO1xuICAgICAgYXJncy5wdXNoKC4uLnBhcmFtMS5mbGF0TWFwKChlKSA9PiBlKSk7XG4gICAgICBvcHRzID0gcGFyYW0yIGFzIFpBZGRPcHRzO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHBhcmFtMSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgdGhpcy5wdXNoWkFkZE9wdHMoYXJncywgcGFyYW0yIGFzIFpBZGRPcHRzKTtcbiAgICAgIGZvciAoY29uc3QgW21lbWJlciwgc2NvcmVdIG9mIE9iamVjdC5lbnRyaWVzKHBhcmFtMSkpIHtcbiAgICAgICAgYXJncy5wdXNoKHNjb3JlIGFzIG51bWJlciwgbWVtYmVyKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wdXNoWkFkZE9wdHMoYXJncywgb3B0cyk7XG4gICAgICBhcmdzLnB1c2gocGFyYW0xLCBwYXJhbTIgYXMgc3RyaW5nKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIlpBRERcIiwgLi4uYXJncyk7XG4gIH1cblxuICBwcml2YXRlIHB1c2haQWRkT3B0cyhcbiAgICBhcmdzOiAoc3RyaW5nIHwgbnVtYmVyKVtdLFxuICAgIG9wdHM/OiBaQWRkT3B0cyxcbiAgKTogdm9pZCB7XG4gICAgaWYgKG9wdHM/Lm1vZGUpIHtcbiAgICAgIGFyZ3MucHVzaChvcHRzLm1vZGUpO1xuICAgIH1cbiAgICBpZiAob3B0cz8uY2gpIHtcbiAgICAgIGFyZ3MucHVzaChcIkNIXCIpO1xuICAgIH1cbiAgfVxuXG4gIHphZGRJbmNyKFxuICAgIGtleTogc3RyaW5nLFxuICAgIHNjb3JlOiBudW1iZXIsXG4gICAgbWVtYmVyOiBzdHJpbmcsXG4gICAgb3B0cz86IFpBZGRPcHRzLFxuICApIHtcbiAgICBjb25zdCBhcmdzOiAoc3RyaW5nIHwgbnVtYmVyKVtdID0gW2tleV07XG4gICAgdGhpcy5wdXNoWkFkZE9wdHMoYXJncywgb3B0cyk7XG4gICAgYXJncy5wdXNoKFwiSU5DUlwiLCBzY29yZSwgbWVtYmVyKTtcbiAgICByZXR1cm4gdGhpcy5leGVjQnVsa1JlcGx5KFwiWkFERFwiLCAuLi5hcmdzKTtcbiAgfVxuXG4gIHpjYXJkKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIlpDQVJEXCIsIGtleSk7XG4gIH1cblxuICB6Y291bnQoa2V5OiBzdHJpbmcsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJaQ09VTlRcIiwga2V5LCBtaW4sIG1heCk7XG4gIH1cblxuICB6aW5jcmJ5KGtleTogc3RyaW5nLCBpbmNyZW1lbnQ6IG51bWJlciwgbWVtYmVyOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQnVsa1JlcGx5PEJ1bGtTdHJpbmc+KFwiWklOQ1JCWVwiLCBrZXksIGluY3JlbWVudCwgbWVtYmVyKTtcbiAgfVxuXG4gIHppbnRlcihcbiAgICBrZXlzOiBzdHJpbmdbXSB8IFtzdHJpbmcsIG51bWJlcl1bXSB8IFJlY29yZDxzdHJpbmcsIG51bWJlcj4sXG4gICAgb3B0cz86IFpJbnRlck9wdHMsXG4gICkge1xuICAgIGNvbnN0IGFyZ3MgPSB0aGlzLnB1c2haU3RvcmVBcmdzKFtdLCBrZXlzLCBvcHRzKTtcbiAgICBpZiAob3B0cz8ud2l0aFNjb3JlKSB7XG4gICAgICBhcmdzLnB1c2goXCJXSVRIU0NPUkVTXCIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseShcIlpJTlRFUlwiLCAuLi5hcmdzKTtcbiAgfVxuXG4gIHppbnRlcnN0b3JlKFxuICAgIGRlc3RpbmF0aW9uOiBzdHJpbmcsXG4gICAga2V5czogc3RyaW5nW10gfCBbc3RyaW5nLCBudW1iZXJdW10gfCBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+LFxuICAgIG9wdHM/OiBaSW50ZXJzdG9yZU9wdHMsXG4gICkge1xuICAgIGNvbnN0IGFyZ3MgPSB0aGlzLnB1c2haU3RvcmVBcmdzKFtkZXN0aW5hdGlvbl0sIGtleXMsIG9wdHMpO1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJaSU5URVJTVE9SRVwiLCAuLi5hcmdzKTtcbiAgfVxuXG4gIHp1bmlvbnN0b3JlKFxuICAgIGRlc3RpbmF0aW9uOiBzdHJpbmcsXG4gICAga2V5czogc3RyaW5nW10gfCBbc3RyaW5nLCBudW1iZXJdW10gfCBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+LFxuICAgIG9wdHM/OiBaVW5pb25zdG9yZU9wdHMsXG4gICkge1xuICAgIGNvbnN0IGFyZ3MgPSB0aGlzLnB1c2haU3RvcmVBcmdzKFtkZXN0aW5hdGlvbl0sIGtleXMsIG9wdHMpO1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJaVU5JT05TVE9SRVwiLCAuLi5hcmdzKTtcbiAgfVxuXG4gIHByaXZhdGUgcHVzaFpTdG9yZUFyZ3MoXG4gICAgYXJnczogKG51bWJlciB8IHN0cmluZylbXSxcbiAgICBrZXlzOiBzdHJpbmdbXSB8IFtzdHJpbmcsIG51bWJlcl1bXSB8IFJlY29yZDxzdHJpbmcsIG51bWJlcj4sXG4gICAgb3B0cz86IFpJbnRlcnN0b3JlT3B0cyB8IFpVbmlvbnN0b3JlT3B0cyxcbiAgKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoa2V5cykpIHtcbiAgICAgIGFyZ3MucHVzaChrZXlzLmxlbmd0aCk7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShrZXlzWzBdKSkge1xuICAgICAgICBrZXlzID0ga2V5cyBhcyBbc3RyaW5nLCBudW1iZXJdW107XG4gICAgICAgIGFyZ3MucHVzaCguLi5rZXlzLm1hcCgoZSkgPT4gZVswXSkpO1xuICAgICAgICBhcmdzLnB1c2goXCJXRUlHSFRTXCIpO1xuICAgICAgICBhcmdzLnB1c2goLi4ua2V5cy5tYXAoKGUpID0+IGVbMV0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFyZ3MucHVzaCguLi4oa2V5cyBhcyBzdHJpbmdbXSkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBhcmdzLnB1c2goT2JqZWN0LmtleXMoa2V5cykubGVuZ3RoKTtcbiAgICAgIGFyZ3MucHVzaCguLi5PYmplY3Qua2V5cyhrZXlzKSk7XG4gICAgICBhcmdzLnB1c2goXCJXRUlHSFRTXCIpO1xuICAgICAgYXJncy5wdXNoKC4uLk9iamVjdC52YWx1ZXMoa2V5cykpO1xuICAgIH1cbiAgICBpZiAob3B0cz8uYWdncmVnYXRlKSB7XG4gICAgICBhcmdzLnB1c2goXCJBR0dSRUdBVEVcIiwgb3B0cy5hZ2dyZWdhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gYXJncztcbiAgfVxuXG4gIHpsZXhjb3VudChrZXk6IHN0cmluZywgbWluOiBzdHJpbmcsIG1heDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIlpMRVhDT1VOVFwiLCBrZXksIG1pbiwgbWF4KTtcbiAgfVxuXG4gIHpwb3BtYXgoa2V5OiBzdHJpbmcsIGNvdW50PzogbnVtYmVyKSB7XG4gICAgaWYgKGNvdW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEJ1bGtTdHJpbmc+KFwiWlBPUE1BWFwiLCBrZXksIGNvdW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJaUE9QTUFYXCIsIGtleSk7XG4gIH1cblxuICB6cG9wbWluKGtleTogc3RyaW5nLCBjb3VudD86IG51bWJlcikge1xuICAgIGlmIChjb3VudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIlpQT1BNSU5cIiwga2V5LCBjb3VudCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEJ1bGtTdHJpbmc+KFwiWlBPUE1JTlwiLCBrZXkpO1xuICB9XG5cbiAgenJhbmdlKFxuICAgIGtleTogc3RyaW5nLFxuICAgIHN0YXJ0OiBudW1iZXIsXG4gICAgc3RvcDogbnVtYmVyLFxuICAgIG9wdHM/OiBaUmFuZ2VPcHRzLFxuICApIHtcbiAgICBjb25zdCBhcmdzID0gdGhpcy5wdXNoWlJhbmdlT3B0cyhba2V5LCBzdGFydCwgc3RvcF0sIG9wdHMpO1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEJ1bGtTdHJpbmc+KFwiWlJBTkdFXCIsIC4uLmFyZ3MpO1xuICB9XG5cbiAgenJhbmdlYnlsZXgoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgbWluOiBzdHJpbmcsXG4gICAgbWF4OiBzdHJpbmcsXG4gICAgb3B0cz86IFpSYW5nZUJ5TGV4T3B0cyxcbiAgKSB7XG4gICAgY29uc3QgYXJncyA9IHRoaXMucHVzaFpSYW5nZU9wdHMoW2tleSwgbWluLCBtYXhdLCBvcHRzKTtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIlpSQU5HRUJZTEVYXCIsIC4uLmFyZ3MpO1xuICB9XG5cbiAgenJhbmdlYnlzY29yZShcbiAgICBrZXk6IHN0cmluZyxcbiAgICBtaW46IG51bWJlciB8IHN0cmluZyxcbiAgICBtYXg6IG51bWJlciB8IHN0cmluZyxcbiAgICBvcHRzPzogWlJhbmdlQnlTY29yZU9wdHMsXG4gICkge1xuICAgIGNvbnN0IGFyZ3MgPSB0aGlzLnB1c2haUmFuZ2VPcHRzKFtrZXksIG1pbiwgbWF4XSwgb3B0cyk7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJaUkFOR0VCWVNDT1JFXCIsIC4uLmFyZ3MpO1xuICB9XG5cbiAgenJhbmsoa2V5OiBzdHJpbmcsIG1lbWJlcjogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJPck5pbFJlcGx5KFwiWlJBTktcIiwga2V5LCBtZW1iZXIpO1xuICB9XG5cbiAgenJlbShrZXk6IHN0cmluZywgLi4ubWVtYmVyczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiWlJFTVwiLCBrZXksIC4uLm1lbWJlcnMpO1xuICB9XG5cbiAgenJlbXJhbmdlYnlsZXgoa2V5OiBzdHJpbmcsIG1pbjogc3RyaW5nLCBtYXg6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJaUkVNUkFOR0VCWUxFWFwiLCBrZXksIG1pbiwgbWF4KTtcbiAgfVxuXG4gIHpyZW1yYW5nZWJ5cmFuayhrZXk6IHN0cmluZywgc3RhcnQ6IG51bWJlciwgc3RvcDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIlpSRU1SQU5HRUJZUkFOS1wiLCBrZXksIHN0YXJ0LCBzdG9wKTtcbiAgfVxuXG4gIHpyZW1yYW5nZWJ5c2NvcmUoa2V5OiBzdHJpbmcsIG1pbjogbnVtYmVyIHwgc3RyaW5nLCBtYXg6IG51bWJlciB8IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJaUkVNUkFOR0VCWVNDT1JFXCIsIGtleSwgbWluLCBtYXgpO1xuICB9XG5cbiAgenJldnJhbmdlKFxuICAgIGtleTogc3RyaW5nLFxuICAgIHN0YXJ0OiBudW1iZXIsXG4gICAgc3RvcDogbnVtYmVyLFxuICAgIG9wdHM/OiBaUmFuZ2VPcHRzLFxuICApIHtcbiAgICBjb25zdCBhcmdzID0gdGhpcy5wdXNoWlJhbmdlT3B0cyhba2V5LCBzdGFydCwgc3RvcF0sIG9wdHMpO1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEJ1bGtTdHJpbmc+KFwiWlJFVlJBTkdFXCIsIC4uLmFyZ3MpO1xuICB9XG5cbiAgenJldnJhbmdlYnlsZXgoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgbWF4OiBzdHJpbmcsXG4gICAgbWluOiBzdHJpbmcsXG4gICAgb3B0cz86IFpSYW5nZUJ5TGV4T3B0cyxcbiAgKSB7XG4gICAgY29uc3QgYXJncyA9IHRoaXMucHVzaFpSYW5nZU9wdHMoW2tleSwgbWluLCBtYXhdLCBvcHRzKTtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIlpSRVZSQU5HRUJZTEVYXCIsIC4uLmFyZ3MpO1xuICB9XG5cbiAgenJldnJhbmdlYnlzY29yZShcbiAgICBrZXk6IHN0cmluZyxcbiAgICBtYXg6IG51bWJlcixcbiAgICBtaW46IG51bWJlcixcbiAgICBvcHRzPzogWlJhbmdlQnlTY29yZU9wdHMsXG4gICkge1xuICAgIGNvbnN0IGFyZ3MgPSB0aGlzLnB1c2haUmFuZ2VPcHRzKFtrZXksIG1heCwgbWluXSwgb3B0cyk7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJaUkVWUkFOR0VCWVNDT1JFXCIsIC4uLmFyZ3MpO1xuICB9XG5cbiAgcHJpdmF0ZSBwdXNoWlJhbmdlT3B0cyhcbiAgICBhcmdzOiAobnVtYmVyIHwgc3RyaW5nKVtdLFxuICAgIG9wdHM/OiBaUmFuZ2VPcHRzIHwgWlJhbmdlQnlMZXhPcHRzIHwgWlJhbmdlQnlTY29yZU9wdHMsXG4gICkge1xuICAgIGlmICgob3B0cyBhcyBaUmFuZ2VCeVNjb3JlT3B0cyk/LndpdGhTY29yZSkge1xuICAgICAgYXJncy5wdXNoKFwiV0lUSFNDT1JFU1wiKTtcbiAgICB9XG4gICAgaWYgKChvcHRzIGFzIFpSYW5nZUJ5U2NvcmVPcHRzKT8ubGltaXQpIHtcbiAgICAgIGFyZ3MucHVzaChcbiAgICAgICAgXCJMSU1JVFwiLFxuICAgICAgICAob3B0cyBhcyBaUmFuZ2VCeVNjb3JlT3B0cykubGltaXQhLm9mZnNldCxcbiAgICAgICAgKG9wdHMgYXMgWlJhbmdlQnlTY29yZU9wdHMpLmxpbWl0IS5jb3VudCxcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBhcmdzO1xuICB9XG5cbiAgenJldnJhbmsoa2V5OiBzdHJpbmcsIG1lbWJlcjogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJPck5pbFJlcGx5KFwiWlJFVlJBTktcIiwga2V5LCBtZW1iZXIpO1xuICB9XG5cbiAgenNjb3JlKGtleTogc3RyaW5nLCBtZW1iZXI6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNCdWxrUmVwbHkoXCJaU0NPUkVcIiwga2V5LCBtZW1iZXIpO1xuICB9XG5cbiAgc2NhbihcbiAgICBjdXJzb3I6IG51bWJlcixcbiAgICBvcHRzPzogU2Nhbk9wdHMsXG4gICkge1xuICAgIGNvbnN0IGFyZ3MgPSB0aGlzLnB1c2hTY2FuT3B0cyhbY3Vyc29yXSwgb3B0cyk7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHkoXCJTQ0FOXCIsIC4uLmFyZ3MpIGFzIFByb21pc2U8XG4gICAgICBbQnVsa1N0cmluZywgQnVsa1N0cmluZ1tdXVxuICAgID47XG4gIH1cblxuICBzc2NhbihcbiAgICBrZXk6IHN0cmluZyxcbiAgICBjdXJzb3I6IG51bWJlcixcbiAgICBvcHRzPzogU1NjYW5PcHRzLFxuICApIHtcbiAgICBjb25zdCBhcmdzID0gdGhpcy5wdXNoU2Nhbk9wdHMoW2tleSwgY3Vyc29yXSwgb3B0cyk7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHkoXCJTU0NBTlwiLCAuLi5hcmdzKSBhcyBQcm9taXNlPFxuICAgICAgW0J1bGtTdHJpbmcsIEJ1bGtTdHJpbmdbXV1cbiAgICA+O1xuICB9XG5cbiAgaHNjYW4oXG4gICAga2V5OiBzdHJpbmcsXG4gICAgY3Vyc29yOiBudW1iZXIsXG4gICAgb3B0cz86IEhTY2FuT3B0cyxcbiAgKSB7XG4gICAgY29uc3QgYXJncyA9IHRoaXMucHVzaFNjYW5PcHRzKFtrZXksIGN1cnNvcl0sIG9wdHMpO1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5KFwiSFNDQU5cIiwgLi4uYXJncykgYXMgUHJvbWlzZTxcbiAgICAgIFtCdWxrU3RyaW5nLCBCdWxrU3RyaW5nW11dXG4gICAgPjtcbiAgfVxuXG4gIHpzY2FuKFxuICAgIGtleTogc3RyaW5nLFxuICAgIGN1cnNvcjogbnVtYmVyLFxuICAgIG9wdHM/OiBaU2Nhbk9wdHMsXG4gICkge1xuICAgIGNvbnN0IGFyZ3MgPSB0aGlzLnB1c2hTY2FuT3B0cyhba2V5LCBjdXJzb3JdLCBvcHRzKTtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseShcIlpTQ0FOXCIsIC4uLmFyZ3MpIGFzIFByb21pc2U8XG4gICAgICBbQnVsa1N0cmluZywgQnVsa1N0cmluZ1tdXVxuICAgID47XG4gIH1cblxuICBwcml2YXRlIHB1c2hTY2FuT3B0cyhcbiAgICBhcmdzOiAobnVtYmVyIHwgc3RyaW5nKVtdLFxuICAgIG9wdHM/OiBTY2FuT3B0cyB8IEhTY2FuT3B0cyB8IFpTY2FuT3B0cyB8IFNTY2FuT3B0cyxcbiAgKSB7XG4gICAgaWYgKG9wdHM/LnBhdHRlcm4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXJncy5wdXNoKFwiTUFUQ0hcIiwgb3B0cy5wYXR0ZXJuKTtcbiAgICB9XG4gICAgaWYgKG9wdHM/LmNvdW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFyZ3MucHVzaChcIkNPVU5UXCIsIG9wdHMuY291bnQpO1xuICAgIH1cbiAgICBpZiAoKG9wdHMgYXMgU2Nhbk9wdHMpPy50eXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFyZ3MucHVzaChcIlRZUEVcIiwgKG9wdHMgYXMgU2Nhbk9wdHMpLnR5cGUhKTtcbiAgICB9XG4gICAgcmV0dXJuIGFyZ3M7XG4gIH1cblxuICB0eCgpIHtcbiAgICByZXR1cm4gY3JlYXRlUmVkaXNQaXBlbGluZSh0aGlzLmV4ZWN1dG9yLmNvbm5lY3Rpb24sIHRydWUpO1xuICB9XG5cbiAgcGlwZWxpbmUoKSB7XG4gICAgcmV0dXJuIGNyZWF0ZVJlZGlzUGlwZWxpbmUodGhpcy5leGVjdXRvci5jb25uZWN0aW9uKTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlZGlzQ29ubmVjdE9wdGlvbnMgZXh0ZW5kcyBSZWRpc0Nvbm5lY3Rpb25PcHRpb25zIHtcbiAgaG9zdG5hbWU6IHN0cmluZztcbiAgcG9ydD86IG51bWJlciB8IHN0cmluZztcbn1cblxuLyoqXG4gKiBDb25uZWN0IHRvIFJlZGlzIHNlcnZlclxuICogQHBhcmFtIG9wdGlvbnNcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gXCIuL21vZC50c1wiO1xuICogY29uc3QgY29ubjEgPSBhd2FpdCBjb25uZWN0KHtob3N0bmFtZTogXCIxMjcuMC4wLjFcIiwgcG9ydDogNjM3OX0pOyAvLyAtPiBUQ1AsIDEyNy4wLjAuMTo2Mzc5XG4gKiBjb25zdCBjb25uMiA9IGF3YWl0IGNvbm5lY3Qoe2hvc3RuYW1lOiBcInJlZGlzLnByb3h5XCIsIHBvcnQ6IDQ0MywgdGxzOiB0cnVlfSk7IC8vIC0+IFRMUywgcmVkaXMucHJveHk6NDQzXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbm5lY3Qob3B0aW9uczogUmVkaXNDb25uZWN0T3B0aW9ucyk6IFByb21pc2U8UmVkaXM+IHtcbiAgY29uc3QgY29ubmVjdGlvbiA9IGNyZWF0ZVJlZGlzQ29ubmVjdGlvbihvcHRpb25zKTtcbiAgYXdhaXQgY29ubmVjdGlvbi5jb25uZWN0KCk7XG4gIGNvbnN0IGV4ZWN1dG9yID0gbmV3IERlZmF1bHRFeGVjdXRvcihjb25uZWN0aW9uKTtcbiAgcmV0dXJuIGNyZWF0ZShleGVjdXRvcik7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgbGF6eSBSZWRpcyBjbGllbnQgdGhhdCB3aWxsIG5vdCBlc3RhYmxpc2ggYSBjb25uZWN0aW9uIHVudGlsIGEgY29tbWFuZCBpcyBhY3R1YWxseSBleGVjdXRlZC5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgY3JlYXRlTGF6eUNsaWVudCB9IGZyb20gXCIuL21vZC50c1wiO1xuICpcbiAqIGNvbnN0IGNsaWVudCA9IGNyZWF0ZUxhenlDbGllbnQoeyBob3N0bmFtZTogXCIxMjcuMC4wLjFcIiwgcG9ydDogNjM3OSB9KTtcbiAqIGNvbnNvbGUuYXNzZXJ0KCFjbGllbnQuaXNDb25uZWN0ZWQpO1xuICogYXdhaXQgY2xpZW50LmdldChcImZvb1wiKTtcbiAqIGNvbnNvbGUuYXNzZXJ0KGNsaWVudC5pc0Nvbm5lY3RlZCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxhenlDbGllbnQob3B0aW9uczogUmVkaXNDb25uZWN0T3B0aW9ucyk6IFJlZGlzIHtcbiAgY29uc3QgY29ubmVjdGlvbiA9IGNyZWF0ZVJlZGlzQ29ubmVjdGlvbihvcHRpb25zKTtcbiAgY29uc3QgZXhlY3V0b3IgPSBjcmVhdGVMYXp5RXhlY3V0b3IoY29ubmVjdGlvbik7XG4gIHJldHVybiBjcmVhdGUoZXhlY3V0b3IpO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIHJlZGlzIGNsaWVudCBmcm9tIGBDb21tYW5kRXhlY3V0b3JgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoZXhlY3V0b3I6IENvbW1hbmRFeGVjdXRvcik6IFJlZGlzIHtcbiAgcmV0dXJuIG5ldyBSZWRpc0ltcGwoZXhlY3V0b3IpO1xufVxuXG4vKipcbiAqIEV4dHJhY3QgUmVkaXNDb25uZWN0T3B0aW9ucyBmcm9tIHJlZGlzIFVSTFxuICogQHBhcmFtIHVybFxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwYXJzZVVSTCB9IGZyb20gXCIuL21vZC50c1wiO1xuICpcbiAqIHBhcnNlVVJMKFwicmVkaXM6Ly9mb286YmFyQGxvY2FsaG9zdDo2Mzc5LzFcIik7IC8vIC0+IHtob3N0bmFtZTogXCJsb2NhbGhvc3RcIiwgcG9ydDogXCI2Mzc5XCIsIHRsczogZmFsc2UsIGRiOiAxLCBuYW1lOiBmb28sIHBhc3N3b3JkOiBiYXJ9XG4gKiBwYXJzZVVSTChcInJlZGlzczovLzEyNy4wLjAuMTo0NDMvP2RiPTImcGFzc3dvcmQ9YmFyXCIpOyAvLyAtPiB7aG9zdG5hbWU6IFwiMTI3LjAuMC4xXCIsIHBvcnQ6IFwiNDQzXCIsIHRsczogdHJ1ZSwgZGI6IDIsIG5hbWU6IHVuZGVmaW5lZCwgcGFzc3dvcmQ6IGJhcn1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VVUkwodXJsOiBzdHJpbmcpOiBSZWRpc0Nvbm5lY3RPcHRpb25zIHtcbiAgY29uc3Qge1xuICAgIHByb3RvY29sLFxuICAgIGhvc3RuYW1lLFxuICAgIHBvcnQsXG4gICAgdXNlcm5hbWUsXG4gICAgcGFzc3dvcmQsXG4gICAgcGF0aG5hbWUsXG4gICAgc2VhcmNoUGFyYW1zLFxuICB9ID0gbmV3IFVSTCh1cmwpO1xuICBjb25zdCBkYiA9IHBhdGhuYW1lLnJlcGxhY2UoXCIvXCIsIFwiXCIpICE9PSBcIlwiXG4gICAgPyBwYXRobmFtZS5yZXBsYWNlKFwiL1wiLCBcIlwiKVxuICAgIDogc2VhcmNoUGFyYW1zLmdldChcImRiXCIpID8/IHVuZGVmaW5lZDtcbiAgcmV0dXJuIHtcbiAgICBob3N0bmFtZTogaG9zdG5hbWUgIT09IFwiXCIgPyBob3N0bmFtZSA6IFwibG9jYWxob3N0XCIsXG4gICAgcG9ydDogcG9ydCAhPT0gXCJcIiA/IHBhcnNlSW50KHBvcnQsIDEwKSA6IDYzNzksXG4gICAgdGxzOiBwcm90b2NvbCA9PSBcInJlZGlzczpcIiA/IHRydWUgOiBzZWFyY2hQYXJhbXMuZ2V0KFwic3NsXCIpID09PSBcInRydWVcIixcbiAgICBkYjogZGIgPyBwYXJzZUludChkYiwgMTApIDogdW5kZWZpbmVkLFxuICAgIG5hbWU6IHVzZXJuYW1lICE9PSBcIlwiID8gdXNlcm5hbWUgOiB1bmRlZmluZWQsXG4gICAgcGFzc3dvcmQ6IHBhc3N3b3JkICE9PSBcIlwiXG4gICAgICA/IHBhc3N3b3JkXG4gICAgICA6IHNlYXJjaFBhcmFtcy5nZXQoXCJwYXNzd29yZFwiKSA/PyB1bmRlZmluZWQsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVJlZGlzQ29ubmVjdGlvbihvcHRpb25zOiBSZWRpc0Nvbm5lY3RPcHRpb25zKTogQ29ubmVjdGlvbiB7XG4gIGNvbnN0IHsgaG9zdG5hbWUsIHBvcnQgPSA2Mzc5LCAuLi5vcHRzIH0gPSBvcHRpb25zO1xuICByZXR1cm4gbmV3IFJlZGlzQ29ubmVjdGlvbihob3N0bmFtZSwgcG9ydCwgb3B0cyk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUxhenlFeGVjdXRvcihjb25uZWN0aW9uOiBDb25uZWN0aW9uKTogQ29tbWFuZEV4ZWN1dG9yIHtcbiAgbGV0IGV4ZWN1dG9yOiBDb21tYW5kRXhlY3V0b3IgfCBudWxsID0gbnVsbDtcbiAgcmV0dXJuIHtcbiAgICBnZXQgY29ubmVjdGlvbigpIHtcbiAgICAgIHJldHVybiBjb25uZWN0aW9uO1xuICAgIH0sXG4gICAgZXhlYyhjb21tYW5kLCAuLi5hcmdzKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZW5kQ29tbWFuZChjb21tYW5kLCBhcmdzKTtcbiAgICB9LFxuICAgIGFzeW5jIHNlbmRDb21tYW5kKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpIHtcbiAgICAgIGlmICghZXhlY3V0b3IpIHtcbiAgICAgICAgZXhlY3V0b3IgPSBuZXcgRGVmYXVsdEV4ZWN1dG9yKGNvbm5lY3Rpb24pO1xuICAgICAgICBpZiAoIWNvbm5lY3Rpb24uaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICBhd2FpdCBjb25uZWN0aW9uLmNvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGV4ZWN1dG9yLnNlbmRDb21tYW5kKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpO1xuICAgIH0sXG4gICAgY2xvc2UoKSB7XG4gICAgICBpZiAoZXhlY3V0b3IpIHtcbiAgICAgICAgcmV0dXJuIGV4ZWN1dG9yLmNsb3NlKCk7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUEyQ0EsU0FBUyxlQUFlLFFBQVEsa0JBQWtCO0FBR2xELFNBQTBCLGVBQWUsUUFBUSxnQkFBZ0I7QUFhakUsU0FBUyxtQkFBbUIsUUFBUSxnQkFBZ0I7QUFDcEQsU0FBUyxVQUFVLEVBQUUsU0FBUyxRQUFRLGNBQWM7QUFDcEQsU0FDRSxVQUFVLEVBQ1YsV0FBVyxFQUNYLFFBQVEsRUFDUixRQUFRLEVBQ1IsaUJBQWlCLEVBQ2pCLFFBQVEsRUFDUixhQUFhLEVBQ2Isc0JBQXNCLEVBQ3RCLG1CQUFtQixFQUNuQixlQUFlLEVBQ2YsTUFBTSxFQUNOLE1BQU0sRUFXTixNQUFNLFFBVUQsY0FBYztBQUVyQixNQUFNLHVCQUF1QjtJQUMzQixtQkFBbUIsSUFBSTtBQUN6QjtBQWtCQSxNQUFNO0lBQ2EsU0FBMEI7SUFFM0MsSUFBSSxXQUFXO1FBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRO0lBQzFDO0lBRUEsSUFBSSxjQUFjO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsV0FBVztJQUM3QztJQUVBLFlBQVksUUFBeUIsQ0FBRTtRQUNyQyxJQUFJLENBQUMsUUFBUSxHQUFHO0lBQ2xCO0lBRUEsWUFDRSxPQUFlLEVBQ2YsSUFBbUIsRUFDbkIsT0FBNEIsRUFDNUI7UUFDQSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFNBQVMsTUFBTTtJQUNsRDtJQUVBLFVBQXlCO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTztJQUN6QztJQUVBLFFBQWM7UUFDWixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUs7SUFDckI7SUFFQSxNQUFNLFVBQ0osT0FBZSxFQUNm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