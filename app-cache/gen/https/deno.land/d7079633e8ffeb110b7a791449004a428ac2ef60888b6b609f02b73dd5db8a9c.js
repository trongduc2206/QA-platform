import { EOFError, ErrorReplyError, InvalidStateError } from "../errors.ts";
import { decoder } from "./_util.ts";
const IntegerReplyCode = ":".charCodeAt(0);
const BulkReplyCode = "$".charCodeAt(0);
const SimpleStringCode = "+".charCodeAt(0);
const ArrayReplyCode = "*".charCodeAt(0);
const ErrorReplyCode = "-".charCodeAt(0);
export async function readReply(reader, returnUint8Arrays) {
    const res = await reader.peek(1);
    if (res == null) {
        throw new EOFError();
    }
    const code = res[0];
    if (code === ErrorReplyCode) {
        await tryReadErrorReply(reader);
    }
    switch(code){
        case IntegerReplyCode:
            return readIntegerReply(reader);
        case SimpleStringCode:
            return readSimpleStringReply(reader, returnUint8Arrays);
        case BulkReplyCode:
            return readBulkReply(reader, returnUint8Arrays);
        case ArrayReplyCode:
            return readArrayReply(reader, returnUint8Arrays);
        default:
            throw new InvalidStateError(`unknown code: '${String.fromCharCode(code)}' (${code})`);
    }
}
async function readIntegerReply(reader) {
    const line = await readLine(reader);
    if (line == null) {
        throw new InvalidStateError();
    }
    return Number.parseInt(decoder.decode(line.subarray(1, line.length)));
}
async function readBulkReply(reader, returnUint8Arrays) {
    const line = await readLine(reader);
    if (line == null) {
        throw new InvalidStateError();
    }
    if (line[0] !== BulkReplyCode) {
        tryParseErrorReply(line);
    }
    const size = parseSize(line);
    if (size < 0) {
        // nil bulk reply
        return null;
    }
    const dest = new Uint8Array(size + 2);
    await reader.readFull(dest);
    const body = dest.subarray(0, dest.length - 2); // Strip CR and LF
    return returnUint8Arrays ? body : decoder.decode(body);
}
async function readSimpleStringReply(reader, returnUint8Arrays) {
    const line = await readLine(reader);
    if (line == null) {
        throw new InvalidStateError();
    }
    if (line[0] !== SimpleStringCode) {
        tryParseErrorReply(line);
    }
    const body = line.subarray(1, line.length);
    return returnUint8Arrays ? body : decoder.decode(body);
}
export async function readArrayReply(reader, returnUint8Arrays) {
    const line = await readLine(reader);
    if (line == null) {
        throw new InvalidStateError();
    }
    const argCount = parseSize(line);
    if (argCount === -1) {
        // `-1` indicates a null array
        return null;
    }
    const array = [];
    for(let i = 0; i < argCount; i++){
        array.push(await readReply(reader, returnUint8Arrays));
    }
    return array;
}
export const okReply = "OK";
function tryParseErrorReply(line) {
    const code = line[0];
    if (code === ErrorReplyCode) {
        throw new ErrorReplyError(decoder.decode(line));
    }
    throw new Error(`invalid line: ${line}`);
}
async function tryReadErrorReply(reader) {
    const line = await readLine(reader);
    if (line == null) {
        throw new InvalidStateError();
    }
    tryParseErrorReply(line);
}
async function readLine(reader) {
    const result = await reader.readLine();
    if (result == null) {
        throw new InvalidStateError();
    }
    const { line  } = result;
    return line;
}
function parseSize(line) {
    const sizeStr = line.subarray(1, line.length);
    const size = parseInt(decoder.decode(sizeStr));
    return size;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvcmVkaXNAdjAuMzEuMC9wcm90b2NvbC9yZXBseS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCdWZSZWFkZXIgfSBmcm9tIFwiLi4vdmVuZG9yL2h0dHBzL2Rlbm8ubGFuZC9zdGQvaW8vYnVmX3JlYWRlci50c1wiO1xuaW1wb3J0IHR5cGUgKiBhcyB0eXBlcyBmcm9tIFwiLi90eXBlcy50c1wiO1xuaW1wb3J0IHsgRU9GRXJyb3IsIEVycm9yUmVwbHlFcnJvciwgSW52YWxpZFN0YXRlRXJyb3IgfSBmcm9tIFwiLi4vZXJyb3JzLnRzXCI7XG5pbXBvcnQgeyBkZWNvZGVyIH0gZnJvbSBcIi4vX3V0aWwudHNcIjtcblxuY29uc3QgSW50ZWdlclJlcGx5Q29kZSA9IFwiOlwiLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBCdWxrUmVwbHlDb2RlID0gXCIkXCIuY2hhckNvZGVBdCgwKTtcbmNvbnN0IFNpbXBsZVN0cmluZ0NvZGUgPSBcIitcIi5jaGFyQ29kZUF0KDApO1xuY29uc3QgQXJyYXlSZXBseUNvZGUgPSBcIipcIi5jaGFyQ29kZUF0KDApO1xuY29uc3QgRXJyb3JSZXBseUNvZGUgPSBcIi1cIi5jaGFyQ29kZUF0KDApO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZFJlcGx5KFxuICByZWFkZXI6IEJ1ZlJlYWRlcixcbiAgcmV0dXJuVWludDhBcnJheXM/OiBib29sZWFuLFxuKTogUHJvbWlzZTx0eXBlcy5SZWRpc1JlcGx5PiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IHJlYWRlci5wZWVrKDEpO1xuICBpZiAocmVzID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRU9GRXJyb3IoKTtcbiAgfVxuXG4gIGNvbnN0IGNvZGUgPSByZXNbMF07XG4gIGlmIChjb2RlID09PSBFcnJvclJlcGx5Q29kZSkge1xuICAgIGF3YWl0IHRyeVJlYWRFcnJvclJlcGx5KHJlYWRlcik7XG4gIH1cblxuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlIEludGVnZXJSZXBseUNvZGU6XG4gICAgICByZXR1cm4gcmVhZEludGVnZXJSZXBseShyZWFkZXIpO1xuICAgIGNhc2UgU2ltcGxlU3RyaW5nQ29kZTpcbiAgICAgIHJldHVybiByZWFkU2ltcGxlU3RyaW5nUmVwbHkocmVhZGVyLCByZXR1cm5VaW50OEFycmF5cyk7XG4gICAgY2FzZSBCdWxrUmVwbHlDb2RlOlxuICAgICAgcmV0dXJuIHJlYWRCdWxrUmVwbHkocmVhZGVyLCByZXR1cm5VaW50OEFycmF5cyk7XG4gICAgY2FzZSBBcnJheVJlcGx5Q29kZTpcbiAgICAgIHJldHVybiByZWFkQXJyYXlSZXBseShyZWFkZXIsIHJldHVyblVpbnQ4QXJyYXlzKTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEludmFsaWRTdGF0ZUVycm9yKFxuICAgICAgICBgdW5rbm93biBjb2RlOiAnJHtTdHJpbmcuZnJvbUNoYXJDb2RlKGNvZGUpfScgKCR7Y29kZX0pYCxcbiAgICAgICk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gcmVhZEludGVnZXJSZXBseShcbiAgcmVhZGVyOiBCdWZSZWFkZXIsXG4pOiBQcm9taXNlPG51bWJlcj4ge1xuICBjb25zdCBsaW5lID0gYXdhaXQgcmVhZExpbmUocmVhZGVyKTtcbiAgaWYgKGxpbmUgPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBJbnZhbGlkU3RhdGVFcnJvcigpO1xuICB9XG5cbiAgcmV0dXJuIE51bWJlci5wYXJzZUludChkZWNvZGVyLmRlY29kZShsaW5lLnN1YmFycmF5KDEsIGxpbmUubGVuZ3RoKSkpO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZWFkQnVsa1JlcGx5KFxuICByZWFkZXI6IEJ1ZlJlYWRlcixcbiAgcmV0dXJuVWludDhBcnJheXM/OiBib29sZWFuLFxuKTogUHJvbWlzZTxzdHJpbmcgfCB0eXBlcy5CaW5hcnkgfCBudWxsPiB7XG4gIGNvbnN0IGxpbmUgPSBhd2FpdCByZWFkTGluZShyZWFkZXIpO1xuICBpZiAobGluZSA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEludmFsaWRTdGF0ZUVycm9yKCk7XG4gIH1cblxuICBpZiAobGluZVswXSAhPT0gQnVsa1JlcGx5Q29kZSkge1xuICAgIHRyeVBhcnNlRXJyb3JSZXBseShsaW5lKTtcbiAgfVxuXG4gIGNvbnN0IHNpemUgPSBwYXJzZVNpemUobGluZSk7XG4gIGlmIChzaXplIDwgMCkge1xuICAgIC8vIG5pbCBidWxrIHJlcGx5XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBkZXN0ID0gbmV3IFVpbnQ4QXJyYXkoc2l6ZSArIDIpO1xuICBhd2FpdCByZWFkZXIucmVhZEZ1bGwoZGVzdCk7XG4gIGNvbnN0IGJvZHkgPSBkZXN0LnN1YmFycmF5KDAsIGRlc3QubGVuZ3RoIC0gMik7IC8vIFN0cmlwIENSIGFuZCBMRlxuICByZXR1cm4gcmV0dXJuVWludDhBcnJheXMgPyBib2R5IDogZGVjb2Rlci5kZWNvZGUoYm9keSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlYWRTaW1wbGVTdHJpbmdSZXBseShcbiAgcmVhZGVyOiBCdWZSZWFkZXIsXG4gIHJldHVyblVpbnQ4QXJyYXlzPzogYm9vbGVhbixcbik6IFByb21pc2U8c3RyaW5nIHwgdHlwZXMuQmluYXJ5PiB7XG4gIGNvbnN0IGxpbmUgPSBhd2FpdCByZWFkTGluZShyZWFkZXIpO1xuICBpZiAobGluZSA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEludmFsaWRTdGF0ZUVycm9yKCk7XG4gIH1cblxuICBpZiAobGluZVswXSAhPT0gU2ltcGxlU3RyaW5nQ29kZSkge1xuICAgIHRyeVBhcnNlRXJyb3JSZXBseShsaW5lKTtcbiAgfVxuICBjb25zdCBib2R5ID0gbGluZS5zdWJhcnJheSgxLCBsaW5lLmxlbmd0aCk7XG4gIHJldHVybiByZXR1cm5VaW50OEFycmF5cyA/IGJvZHkgOiBkZWNvZGVyLmRlY29kZShib2R5KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRBcnJheVJlcGx5KFxuICByZWFkZXI6IEJ1ZlJlYWRlcixcbiAgcmV0dXJuVWludDhBcnJheXM/OiBib29sZWFuLFxuKTogUHJvbWlzZTxBcnJheTx0eXBlcy5SZWRpc1JlcGx5PiB8IG51bGw+IHtcbiAgY29uc3QgbGluZSA9IGF3YWl0IHJlYWRMaW5lKHJlYWRlcik7XG4gIGlmIChsaW5lID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgSW52YWxpZFN0YXRlRXJyb3IoKTtcbiAgfVxuXG4gIGNvbnN0IGFyZ0NvdW50ID0gcGFyc2VTaXplKGxpbmUpO1xuICBpZiAoYXJnQ291bnQgPT09IC0xKSB7XG4gICAgLy8gYC0xYCBpbmRpY2F0ZXMgYSBudWxsIGFycmF5XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBhcnJheTogQXJyYXk8dHlwZXMuUmVkaXNSZXBseT4gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmdDb3VudDsgaSsrKSB7XG4gICAgYXJyYXkucHVzaChhd2FpdCByZWFkUmVwbHkocmVhZGVyLCByZXR1cm5VaW50OEFycmF5cykpO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuZXhwb3J0IGNvbnN0IG9rUmVwbHkgPSBcIk9LXCI7XG5cbmZ1bmN0aW9uIHRyeVBhcnNlRXJyb3JSZXBseShsaW5lOiBVaW50OEFycmF5KTogbmV2ZXIge1xuICBjb25zdCBjb2RlID0gbGluZVswXTtcbiAgaWYgKGNvZGUgPT09IEVycm9yUmVwbHlDb2RlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yUmVwbHlFcnJvcihkZWNvZGVyLmRlY29kZShsaW5lKSk7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIGxpbmU6ICR7bGluZX1gKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gdHJ5UmVhZEVycm9yUmVwbHkocmVhZGVyOiBCdWZSZWFkZXIpOiBQcm9taXNlPG5ldmVyPiB7XG4gIGNvbnN0IGxpbmUgPSBhd2FpdCByZWFkTGluZShyZWFkZXIpO1xuICBpZiAobGluZSA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEludmFsaWRTdGF0ZUVycm9yKCk7XG4gIH1cbiAgdHJ5UGFyc2VFcnJvclJlcGx5KGxpbmUpO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZWFkTGluZShyZWFkZXI6IEJ1ZlJlYWRlcik6IFByb21pc2U8VWludDhBcnJheT4ge1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCByZWFkZXIucmVhZExpbmUoKTtcbiAgaWYgKHJlc3VsdCA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEludmFsaWRTdGF0ZUVycm9yKCk7XG4gIH1cblxuICBjb25zdCB7IGxpbmUgfSA9IHJlc3VsdDtcbiAgcmV0dXJuIGxpbmU7XG59XG5cbmZ1bmN0aW9uIHBhcnNlU2l6ZShsaW5lOiBVaW50OEFycmF5KTogbnVtYmVyIHtcbiAgY29uc3Qgc2l6ZVN0ciA9IGxpbmUuc3ViYXJyYXkoMSwgbGluZS5sZW5ndGgpO1xuICBjb25zdCBzaXplID0gcGFyc2VJbnQoZGVjb2Rlci5kZWNvZGUoc2l6ZVN0cikpO1xuICByZXR1cm4gc2l6ZTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxTQUFTLFFBQVEsRUFBRSxlQUFlLEVBQUUsaUJBQWlCLFFBQVEsZUFBZTtBQUM1RSxTQUFTLE9BQU8sUUFBUSxhQUFhO0FBRXJDLE1BQU0sbUJBQW1CLElBQUksVUFBVSxDQUFDO0FBQ3hDLE1BQU0sZ0JBQWdCLElBQUksVUFBVSxDQUFDO0FBQ3JDLE1BQU0sbUJBQW1CLElBQUksVUFBVSxDQUFDO0FBQ3hDLE1BQU0saUJBQWlCLElBQUksVUFBVSxDQUFDO0FBQ3RDLE1BQU0saUJBQWlCLElBQUksVUFBVSxDQUFDO0FBRXRDLE9BQU8sZUFBZSxVQUNwQixNQUFpQixFQUNqQixpQkFBMkIsRUFDQTtJQUMzQixNQUFNLE1BQU0sTUFBTSxPQUFPLElBQUksQ0FBQztJQUM5QixJQUFJLE9BQU8sSUFBSSxFQUFFO1FBQ2YsTUFBTSxJQUFJLFdBQVc7SUFDdkIsQ0FBQztJQUVELE1BQU0sT0FBTyxHQUFH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