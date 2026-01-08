import { Effect, Layer } from "effect";
import { RedisService } from "./service";

export const RedisServiceLive = Layer.effect(
  RedisService,
  Effect.gen(function* () {
    const { redisClient } = yield* Effect.promise(() => import("./client"));

    return {
      get: <T>(key: string) =>
        Effect.promise<T | null>(() => redisClient.get<T>(key)).pipe(
          Effect.orElseSucceed(() => null)
        ),
        set: (key, value, options) =>
            Effect.promise<string | null>(async () => {
              if (options?.ex !== undefined && options?.nx === true) {
                return (await redisClient.set(key, value, {
                  ex: options.ex,
                  nx: true,
                })) as string | null;
              }
          
              if (options?.ex !== undefined) {
                return (await redisClient.set(key, value, {
                  ex: options.ex,
                })) as string | null;
              }
          
              return (await redisClient.set(key, value)) as string | null;
            }).pipe(Effect.orElseSucceed(() => null)),
      del: (key: string) =>
        Effect.promise<void>(() => redisClient.del(key).then(() => undefined)).pipe(
          Effect.orElseSucceed(() => undefined)
        ),
    };
  })
);