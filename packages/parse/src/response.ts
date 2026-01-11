import { Match } from "effect";
import { NextResponse } from "next/server";
import type { AppError } from "./errors";

export const errorToResponse = (error: AppError): NextResponse =>
  Match.value(error).pipe(
    Match.tag("RateLimitedError", (e) =>
      NextResponse.json(
        { error: "Too many requests", remaining: e.remaining, reset: e.reset },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((e.reset - Date.now()) / 1000)) }
        }
      )
    ),
    Match.tag("IPFormatError", "InvalidUrlError", (e) =>
      NextResponse.json({ error: e.message }, { status: 400 })
    ),
    Match.tag("BlockedHostError", (e) =>
      NextResponse.json({ error: `Blocked: ${e.reason}` }, { status: 403 })
    ),
    Match.tag("FetchError", (e) =>
      NextResponse.json({ error: e.message }, { status: e.status ?? 502 })
    ),
    Match.tag("ParseError", (e) =>
      NextResponse.json({ error: e.message }, { status: 422 })
    ),
    Match.exhaustive
  );