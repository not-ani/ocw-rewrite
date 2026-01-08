import { Data } from "effect";


export class RateLimitedError extends Data.TaggedError("RateLimitedError")<{
	remaining: number;
	reset: number;
}> {}


export class InvalidUrlError extends Data.TaggedError("InvalidUrlError")<{
	message: string;
}> {}


export class BlockedHostError extends Data.TaggedError("BlockedHostError")<{
	host: string;
	reason: string;
}> {}


export class FetchError extends Data.TaggedError("FetchError")<{
	message: string;
	status?: number;
}> {}


export class ParseError extends Data.TaggedError("ParseError")<{
	message: string;
}> {}


export type AppError =
	| RateLimitedError
	| InvalidUrlError
	| BlockedHostError
	| FetchError
	| ParseError;
