import { NextResponse } from "next/server";
import {
	RateLimitedError,
	InvalidUrlError,
	BlockedHostError,
	FetchError,
	ParseError,
	AppError,
} from "./errors";

/**
 * Convert Effect error to Next.js response
 */
export const errorToResponse = (error: AppError): NextResponse => {
	switch (error._tag) {
		case "RateLimitedError":
			return NextResponse.json(
				{
					error: "Too many requests",
					remaining: error.remaining,
					reset: error.reset,
				},
				{
					status: 429,
					headers: {
						"Retry-After": String(
							Math.ceil((error.reset - Date.now()) / 1000),
						),
					},
				},
			);
		case "InvalidUrlError":
			return NextResponse.json({ error: error.message }, { status: 400 });
		case "BlockedHostError":
			return NextResponse.json(
				{ error: `Blocked: ${error.reason}` },
				{ status: 403 },
			);
		case "FetchError":
			return NextResponse.json(
				{ error: error.message },
				{ status: error.status ?? 502 },
			);
		case "ParseError":
			return NextResponse.json({ error: error.message }, { status: 422 });
	}
};
