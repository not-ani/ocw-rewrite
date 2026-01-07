import { Effect, Option } from "effect";
import { ratelimit } from "@/lib/redis/rate-limit";
import {
	acquireRevalidationLock,
	getCached,
	releaseLock,
	setCache,
} from "./cache";
import { type AppError, RateLimitedError } from "./errors";
import { fetchWithConditional } from "./fetch";
import { parseHtmlToMarkdown } from "./parser";
import type { ResponseData } from "./types";
import { getClientIp, hashContent, hashUrl, isExpired, isStale } from "./utils";
import { parseAndValidateUrl, validateHostSecurity } from "./validation";

/**
 * Check rate limit for client IP
 */
const checkRateLimit = (ip: string): Effect.Effect<void, RateLimitedError> =>
	Effect.tryPromise({
		try: () => ratelimit.limit(ip),
		catch: () => new RateLimitedError({ remaining: 0, reset: Date.now() }),
	}).pipe(
		Effect.flatMap((r) =>
			r.success
				? Effect.void
				: Effect.fail(
						new RateLimitedError({ remaining: r.remaining, reset: r.reset }),
					),
		),
	);

/**
 * Main request handler with stale-while-revalidate caching strategy
 */
export const handleRequest = (
	request: Request,
): Effect.Effect<ResponseData, AppError> =>
	Effect.gen(function* () {
		yield* checkRateLimit(getClientIp(request));

		const urlObj = yield* parseAndValidateUrl(request.url);
		yield* validateHostSecurity(urlObj);

		const urlHash = hashUrl(urlObj.href);
		const cached = yield* getCached(urlHash);

		// CASE 1: Fresh cache hit - return immediately
		if (Option.isSome(cached) && !isStale(cached.value.fetchedAt)) {
			return {
				markdown: cached.value.markdown,
				cached: true,
				age: Math.floor((Date.now() - cached.value.fetchedAt) / 1000),
			};
		}

		if (Option.isSome(cached) && !isExpired(cached.value.fetchedAt)) {
			const cachedData = cached.value;

			const gotLock = yield* acquireRevalidationLock(urlHash);

			if (gotLock) {
				// Fire-and-forget background revalidation
				Effect.runPromise(
					Effect.gen(function* () {
						const result = yield* fetchWithConditional(
							urlObj.href,
							cachedData.etag,
							cachedData.lastModified,
						).pipe(Effect.catchAll(() => Effect.succeed(null)));

						if (!result) {
							yield* releaseLock(urlHash);
							return;
						}

						if (result.notModified) {
							// Content unchanged - just update timestamp
							yield* setCache(urlHash, {
								...cachedData,
								fetchedAt: Date.now(),
							});
						} else {
							// Content changed - parse and cache new content
							const markdown = yield* parseHtmlToMarkdown(result.html).pipe(
								Effect.catchAll(() => Effect.succeed(cachedData.markdown)),
							);

							const newHash = hashContent(markdown);

							// Only update if content actually changed
							if (newHash !== cachedData.contentHash) {
								yield* setCache(urlHash, {
									markdown,
									fetchedAt: Date.now(),
									etag: result.etag,
									lastModified: result.lastModified,
									contentHash: newHash,
								});
							} else {
								yield* setCache(urlHash, {
									...cachedData,
									fetchedAt: Date.now(),
								});
							}
						}

						yield* releaseLock(urlHash);
					}),
				).catch(() => {});
			}

			// Return stale content immediately
			return {
				markdown: cachedData.markdown,
				cached: true,
				age: Math.floor((Date.now() - cachedData.fetchedAt) / 1000),
			};
		}

		// CASE 3: No cache or expired - must fetch fresh
		const result = yield* fetchWithConditional(urlObj.href);
		const markdown = yield* parseHtmlToMarkdown(result.html);

		// Cache the result
		yield* setCache(urlHash, {
			markdown,
			fetchedAt: Date.now(),
			etag: result.etag,
			lastModified: result.lastModified,
			contentHash: hashContent(markdown),
		});

		return { markdown, cached: false };
	});
