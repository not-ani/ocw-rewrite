import { Context, Effect } from "effect";

export interface RedisOps {
  readonly get: <T>(key: string) => Effect.Effect<T | null>;
  readonly set: (
    key: string,
    value: unknown,
    options?: { ex?: number; nx?: boolean }
  ) => Effect.Effect<string | null>;
  readonly del: (key: string) => Effect.Effect<void>;
}

export class RedisService extends Context.Tag("RedisService")<
  RedisService,
  RedisOps
>() {}