import { Effect, Layer } from "effect";
import { RatelimitService } from "@ocw/redis/rate-limit";
import type { RedisService } from "@ocw/redis/redis";
import { RateLimitedError } from "./errors";
import type { AppError } from "./errors";
import type { CachedContent, ResponseData } from "./types";
import { ParserService } from "./parser/service";
export declare const checkRateLimit: (ip: string) => Effect.Effect<void, RateLimitedError, RatelimitService>;
export declare const revalidateInBackground: (urlObj: URL, urlHash: string, cachedData: CachedContent) => Effect.Effect<void, never, RedisService | ParserService>;
export declare const handleRequest: (request: Request) => Effect.Effect<ResponseData, AppError, RatelimitService | RedisService | ParserService>;
export declare const HtmlParserLayer: Layer.Layer<ParserService | RedisService | RatelimitService, never, never>;
//# sourceMappingURL=handler.d.ts.map