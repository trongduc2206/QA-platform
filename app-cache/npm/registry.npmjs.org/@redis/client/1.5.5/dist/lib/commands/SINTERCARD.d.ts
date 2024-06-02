import { RedisCommandArgument, RedisCommandArguments } from '.';
export declare const FIRST_KEY_INDEX = 2;
export declare const IS_READ_ONLY = true;
export declare function transformArguments(keys: Array<RedisCommandArgument> | RedisCommandArgument, limit?: number): RedisCommandArguments;
export declare function transformReply(): number;