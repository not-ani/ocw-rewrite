import { Effect, Option } from "effect";
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

const getRatelimit = async () => {
	const { ratelimit } = await import("@/lib/redis/rate-limit");
	return ratelimit;
};

const checkRateLimit = (ip: string): Effect.Effect<void, RateLimitedError> =>
	Effect.tryPromise({
		try: async () => {
			const ratelimit = await getRatelimit();
			return ratelimit.limit(ip);
		},
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


export const handleRequest = (
	request: Request,
): Effect.Effect<ResponseData, AppError> =>
	Effect.gen(function* () {
		yield* checkRateLimit(getClientIp(request));

		const urlObj = yield* parseAndValidateUrl(request.url);
		yield* validateHostSecurity(urlObj);

		const urlHash = hashUrl(urlObj.href);
		const cached = yield* getCached(urlHash);

		
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
							
							yield* setCache(urlHash, {
								...cachedData,
								fetchedAt: Date.now(),
							});
						} else {
							
							const markdown = yield* parseHtmlToMarkdown(result.html).pipe(
								Effect.catchAll(() => Effect.succeed(cachedData.markdown)),
							);

							const newHash = hashContent(markdown);

							
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

			
			return {
				markdown: cachedData.markdown,
				cached: true,
				age: Math.floor((Date.now() - cachedData.fetchedAt) / 1000),
			};
		}

		
		const result = yield* fetchWithConditional(urlObj.href);
		const markdown = yield* parseHtmlToMarkdown(result.html);

		
		yield* setCache(urlHash, {
			markdown,
			fetchedAt: Date.now(),
			etag: result.etag,
			lastModified: result.lastModified,
			contentHash: hashContent(markdown),
		});

		return { markdown, cached: false };
	});
