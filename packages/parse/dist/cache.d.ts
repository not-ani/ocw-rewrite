import { Effect, Option } from "effect";
import type { CachedContent } from "./types";
import { RedisService } from "@ocw/redis/redis";
export declare const getCached: (urlHash: string) => Effect.Effect<Option.Option<CachedContent>, never, RedisService>;
export declare const setCache: (urlHash: string, content: CachedContent) => Effect.Effect<void, never, RedisService>;
export declare const acquireRevalidationLock: (urlHash: string) => Effect.Effect<boolean, never, RedisService>;
export declare const releaseLock: (urlHash: string) => Effect.Effect<void, never, RedisService>;
//# sourceMappingURL=cache.d.ts.map