import { Effect, Option } from "effect";
import { redis } from "@/lib/redis/rate-limit";
import { CachedContent } from "./types";
import { CACHE_PREFIX, LOCK_PREFIX, REVALIDATE_LOCK_TTL, STALE_TTL } from "./config";

/**
 * Get cached content from Redis
 */
export const getCached = (
	urlHash: string,
): Effect.Effect<Option.Option<CachedContent>, never> =>
	Effect.tryPromise({
		try: async () => {
			const data = await redis.get<CachedContent>(`${CACHE_PREFIX}${urlHash}`);
			return data ? Option.some(data) : Option.none();
		},
		catch: () => Option.none<CachedContent>(),
	}).pipe(Effect.catchAll(() => Effect.succeed(Option.none<CachedContent>())));

/**
 * Set cached content in Redis
 */
export const setCache = (
	urlHash: string,
	content: CachedContent,
): Effect.Effect<void, never> =>
	Effect.tryPromise({
		try: () =>
			redis.set(`${CACHE_PREFIX}${urlHash}`, content, { ex: STALE_TTL }),
		catch: () => undefined,
	}).pipe(
		Effect.catchAll(() => Effect.void),
		Effect.map(() => undefined),
	);

/**
 * Acquire a revalidation lock to prevent concurrent revalidation
 */
export const acquireRevalidationLock = (
	urlHash: string,
): Effect.Effect<boolean, never> =>
	Effect.tryPromise({
		try: async () => {
			const result = await redis.set(`${LOCK_PREFIX}${urlHash}`, "1", {
				nx: true,
				ex: REVALIDATE_LOCK_TTL,
			});
			return result === "OK";
		},
		catch: () => false,
	}).pipe(Effect.catchAll(() => Effect.succeed(false)));

/**
 * Release a revalidation lock
 */
export const releaseLock = (urlHash: string): Effect.Effect<void, never> =>
	Effect.tryPromise({
		try: () => redis.del(`${LOCK_PREFIX}${urlHash}`),
		catch: () => undefined,
	}).pipe(
		Effect.catchAll(() => Effect.void),
		Effect.map(() => undefined),
	);
