import { Effect, Option } from "effect";
import type { CachedContent } from "./types";
import { CACHE_PREFIX, LOCK_PREFIX, REVALIDATE_LOCK_TTL, STALE_TTL } from "./config";

const getRedis = async () => {
	const { redis } = await import("@/lib/redis/rate-limit");
	return redis;
};

export const getCached = (
	urlHash: string,
): Effect.Effect<Option.Option<CachedContent>, never> =>
	Effect.tryPromise({
		try: async () => {
			const redis = await getRedis();
			const data = await redis.get<CachedContent>(`${CACHE_PREFIX}${urlHash}`);
			return data ? Option.some(data) : Option.none();
		},
		catch: () => Option.none<CachedContent>(),
	}).pipe(Effect.catchAll(() => Effect.succeed(Option.none<CachedContent>())));


export const setCache = (
	urlHash: string,
	content: CachedContent,
): Effect.Effect<void, never> =>
	Effect.tryPromise({
		try: async () => {
			const redis = await getRedis();
			await redis.set(`${CACHE_PREFIX}${urlHash}`, content, { ex: STALE_TTL });
		},
		catch: () => undefined,
	}).pipe(
		Effect.catchAll(() => Effect.void),
		Effect.map(() => undefined),
	);


export const acquireRevalidationLock = (
	urlHash: string,
): Effect.Effect<boolean, never> =>
	Effect.tryPromise({
		try: async () => {
			const redis = await getRedis();
			const result = await redis.set(`${LOCK_PREFIX}${urlHash}`, "1", {
				nx: true,
				ex: REVALIDATE_LOCK_TTL,
			});
			return result === "OK";
		},
		catch: () => false,
	}).pipe(Effect.catchAll(() => Effect.succeed(false)));


export const releaseLock = (urlHash: string): Effect.Effect<void, never> =>
	Effect.tryPromise({
		try: async () => {
			const redis = await getRedis();
			await redis.del(`${LOCK_PREFIX}${urlHash}`);
		},
		catch: () => undefined,
	}).pipe(
		Effect.catchAll(() => Effect.void),
		Effect.map(() => undefined),
	);
