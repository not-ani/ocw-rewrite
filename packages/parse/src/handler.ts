import { Effect, Layer, Option } from "effect";
import { RatelimitService, RatelimitServiceLive } from "@ocw/redis/rate-limit";
import { RedisServiceLive, RedisService } from "@ocw/redis/redis";
import { RateLimitedError, type AppError } from "./errors";
import type { CachedContent, ResponseData } from "./types";
import {
	acquireRevalidationLock,
	getCached,
	releaseLock,
	setCache,
} from "./cache";
import { fetchWithConditional } from "./fetch";
import { ParserService, ParserServiceLive } from "./parser/service";
import { getClientIp, hashContent, isExpired, isStale } from "./utils";
import { parseAndValidateUrl, validateHostSecurity } from "./validation";

export const checkRateLimit = (
	ip: string,
): Effect.Effect<void, RateLimitedError, RatelimitService> =>
	Effect.gen(function* () {
		const ratelimit = yield* RatelimitService;
		const result = yield* ratelimit.limit(ip);

		if (!result.success) {
			return yield* Effect.fail(
				new RateLimitedError({
					remaining: result.remaining,
					reset: result.reset,
				}),
			);
		}
	});

export const revalidateInBackground = (
	urlObj: URL,
	urlHash: string,
	cachedData: CachedContent,
): Effect.Effect<void, never, RedisService | ParserService> =>
	Effect.gen(function* () {
		const parser = yield* ParserService;
		const gotLock = yield* acquireRevalidationLock(urlHash);
		if (!gotLock) return;

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
			const markdown = yield* parser
				.parseHtmlToMarkdown(result.html)
				.pipe(Effect.catchAll(() => Effect.succeed(cachedData.markdown)));

			const contentHash = hashContent(markdown);

			yield* setCache(urlHash, {
				markdown,
				fetchedAt: Date.now(),
				etag: result.etag,
				lastModified: result.lastModified,
				contentHash,
			});
		}

		yield* releaseLock(urlHash);
	});

export const handleRequest = (
	request: Request,
): Effect.Effect<
	ResponseData,
	AppError,
	RatelimitService | RedisService | ParserService
> =>
	Effect.gen(function* () {
		const parser = yield* ParserService;

		yield* checkRateLimit(getClientIp(request));
		const urlObj = yield* parseAndValidateUrl(request.url);
		yield* validateHostSecurity(urlObj);

		const urlHash = hashContent(urlObj.href);
		const cached = yield* getCached(urlHash);

		if (Option.isSome(cached)) {
			const cachedData = cached.value;
			const age = Math.floor((Date.now() - cachedData.fetchedAt) / 1000);

			if (!isStale(cachedData.fetchedAt)) {
				return { markdown: cachedData.markdown, cached: true, age };
			}

			if (!isExpired(cachedData.fetchedAt)) {
				yield* revalidateInBackground(urlObj, urlHash, cachedData).pipe(
					Effect.forkDaemon,
				);
				return { markdown: cachedData.markdown, cached: true, age };
			}
		}

		const result = yield* fetchWithConditional(urlObj.href);
		const markdown = yield* parser.parseHtmlToMarkdown(result.html);

		yield* setCache(urlHash, {
			markdown,
			fetchedAt: Date.now(),
			etag: result.etag,
			lastModified: result.lastModified,
			contentHash: hashContent(markdown),
		});

		return { markdown, cached: false };
	});

export const HtmlParserLayer = Layer.mergeAll(
	ParserServiceLive,
	RedisServiceLive,
	RatelimitServiceLive
  );