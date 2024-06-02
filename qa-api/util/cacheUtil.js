import { connect } from "../deps.js";


let redis;
try {
  if(Deno.env.get("REDIS_HOST") && Deno.env.get("REDIS_PORT")) {
    console.log("cache - redis k8s")
    const host = Deno.env.get("REDIS_HOST");
    const port = Deno.env.get("REDIS_PORT");
    if(Deno.env.get("REDIS_PASS")) {
      const password = Deno.env.get("REDIS_PASS")
      redis = await connect({
        hostname: host,
        port: port,
        password: password
      })
    } else {
      redis = await connect({
        hostname: host,
        port: port,
      })
    }
  } else {
    console.log("cache - redis normal")
    redis = await connect({
      hostname: "redis",
      port: 6379,
    }); 
  }
} catch(e) {
  console.log("redis connection failed")
  console.log(e)
}


const cacheMethodCalls = (object, methodsToFlushCacheWith = []) => {
  const handler = {
    get: (module, methodName) => {
      const method = module[methodName];
      return async (...methodArgs) => {
        if (methodsToFlushCacheWith.includes(methodName)) {
          await redis.flushdb()
          return await method.apply(this, methodArgs);
        }

        const cacheKey = `${methodName}-${JSON.stringify(methodArgs)}`;
        const cacheResult = await redis.get(cacheKey);
        if (!cacheResult) {
          const result = await method.apply(this, methodArgs);
          await redis.set(cacheKey, JSON.stringify(result));
          return result;
        }

        return JSON.parse(cacheResult);
      };
    },
  };

  return new Proxy(object, handler);
};

export { cacheMethodCalls };