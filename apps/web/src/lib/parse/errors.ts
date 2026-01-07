import { Data } from "effect";

/**
 * Rate limit error - thrown when user exceeds rate limit
 */
export class RateLimitedError extends Data.TaggedError("RateLimitedError")<{
	remaining: number;
	reset: number;
}> {}

/**
 * Invalid URL error - thrown when URL is malformed or invalid
 */
export class InvalidUrlError extends Data.TaggedError("InvalidUrlError")<{
	message: string;
}> {}

/**
 * Blocked host error - thrown when host is not allowlisted or resolves to private IP
 */
export class BlockedHostError extends Data.TaggedError("BlockedHostError")<{
	host: string;
	reason: string;
}> {}

/**
 * Fetch error - thrown when HTTP request fails
 */
export class FetchError extends Data.TaggedError("FetchError")<{
	message: string;
	status?: number;
}> {}

/**
 * Parse error - thrown when HTML parsing or markdown conversion fails
 */
export class ParseError extends Data.TaggedError("ParseError")<{
	message: string;
}> {}

/**
 * Union type of all possible application errors
 */
export type AppError =
	| RateLimitedError
	| InvalidUrlError
	| BlockedHostError
	| FetchError
	| ParseError;
