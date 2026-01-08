import { Effect, Option } from "effect";
import {
	CACHE_PREFIX,
	LOCK_PREFIX,
	REVALIDATE_LOCK_TTL,
	STALE_TTL,
} from "./config";
import type { CachedContent } from "./types";
import { RedisService } from "@ocw/redis/redis";

export const getCached = (
	urlHash: string,
): Effect.Effect<Option.Option<CachedContent>, never, RedisService> =>
	Effect.gen(function* () {
		const redis = yield* RedisService;
		const data = yield* redis.get<CachedContent>(`${CACHE_PREFIX}${urlHash}`);
		return Option.fromNullable(data);
	});

export const setCache = (
	urlHash: string,
	content: CachedContent,
): Effect.Effect<void, never, RedisService> =>
	Effect.gen(function* () {
		const redis = yield* RedisService;
		yield* redis.set(`${CACHE_PREFIX}${urlHash}`, content, {
			ex: STALE_TTL,
		});
	});
export const acquireRevalidationLock = (
	urlHash: string,
): Effect.Effect<boolean, never, RedisService> =>
	Effect.gen(function* () {
		const redis = yield* RedisService;
		const result = yield* redis.set(`${LOCK_PREFIX}${urlHash}`, "1", {
			nx: true,
			ex: REVALIDATE_LOCK_TTL,
		});
		return result === "OK";
	});

export const releaseLock = (
	urlHash: string,
): Effect.Effect<void, never, RedisService> =>
	Effect.gen(function* () {
		const redis = yield* RedisService;
		yield* redis.del(`${LOCK_PREFIX}${urlHash}`);
	});
