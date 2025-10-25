import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import TurndownService from "turndown";
// @ts-expect-error
import { gfm } from "turndown-plugin-gfm";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const url = searchParams.get("url");

		if (!url) {
			return NextResponse.json(
				{ error: "URL parameter is required" },
				{ status: 400 },
			);
		}

		const response = await fetch(url);
		if (!response.ok) {
			return NextResponse.json(
				{ error: "Failed to fetch URL" },
				{ status: 400 },
			);
		}

		const html = await response.text();

		// Parse with Cheerio instead of JSDOM
		const $ = cheerio.load(html);
		const mathImages = $("img[alt]");

		mathImages.each((_i, img) => {
			const alt = $(img).attr("alt");
			if (alt && /[a-zA-Z0-9\\^_=+]/.test(alt)) {
				$(img).replaceWith(`$$${alt}$$`);
			}
		});

		// Remove unwanted elements
		$("script, style, noscript, link, meta, head").remove();

		// Get content from main, .doc-content, or body
		const content =
			$("main").html() || $(".doc-content").html() || $("body").html() || "";
		console.log("content", content);

		const turndownService = new TurndownService();
		turndownService.use(gfm);

		const markdown = turndownService.turndown(content);
		console.log("markdown", markdown);

		return NextResponse.json({ markdown });
	} catch (_error) {
		return NextResponse.json(
			{ error: "Invalid URL or fetch failed" },
			{ status: 400 },
		);
	}
}
