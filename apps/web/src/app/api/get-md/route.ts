import { Effect } from "effect";
import { NextResponse } from "next/server";
import { CACHE_TTL, STALE_TTL, errorToResponse } from "@ocw/parse";
import { handleRequest, HtmlParserLayer } from "@ocw/parse";
import { getPostHogServer } from "@/lib/posthog-server";
const NOISE_ERRORS = [
  "RateLimitedError",
  "InvalidUrlError",
  "BlockedHostError",
  "IPFormatError",
];
export async function GET(request: Request) {
  const posthog = getPostHogServer();
  const { pathname, searchParams } = new URL(request.url);

  const program = handleRequest(request).pipe(
    Effect.tapError((error) =>
      Effect.sync(() => {
        if (!NOISE_ERRORS.includes(error._tag)) {
          posthog.capture({
            distinctId: "system",
            event: "api_failure",
            properties: {
              type: error._tag,
              route: pathname,
              params: Object.fromEntries(searchParams),
              method: request.method,
              ...error,
            },
          });
        }
      }),
    ),
    Effect.match({
      onSuccess: ({ markdown, cached, age }) =>
        NextResponse.json(
          { markdown },
          {
            headers: {
              "X-Cache": cached ? "HIT" : "MISS",
              ...(age !== undefined && { "X-Cache-Age": String(age) }),
              "Cache-Control": `public, max-age=${CACHE_TTL}, stale-while-revalidate=${STALE_TTL - CACHE_TTL}`,
            },
          },
        ),
      onFailure: (error) => errorToResponse(error),
    }),
    Effect.provide(HtmlParserLayer),
  );
  return await Effect.runPromise(program);
}
