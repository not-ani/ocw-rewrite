import { Effect } from "effect";
import { NextResponse } from "next/server";
import { CACHE_TTL, STALE_TTL } from "@/lib/parse/config";
import { handleRequest } from "@/lib/parse/handler";
import { errorToResponse } from "@/lib/parse/response";


export async function GET(request: Request) {
	const result = await Effect.runPromiseExit(handleRequest(request));

	if (result._tag === "Success") {
		const { markdown, cached, age } = result.value;

		return NextResponse.json(
			{ markdown },
			{
				headers: {
					"X-Cache": cached ? "HIT" : "MISS",
					...(age !== undefined && { "X-Cache-Age": String(age) }),
					"Cache-Control": `public, max-age=${CACHE_TTL}, stale-while-revalidate=${STALE_TTL - CACHE_TTL}`,
				},
			},
		);
	}

	if (result.cause._tag === "Fail") {
		return errorToResponse(result.cause.error);
	}

	console.error("Unexpected error:", result.cause);
	return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
