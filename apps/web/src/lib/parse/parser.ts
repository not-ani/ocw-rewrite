import { Effect } from "effect";
import { parseHTML } from "linkedom";
import TurndownService from "turndown";
// @ts-expect-error - no types
import { gfm } from "turndown-plugin-gfm";
import { ParseError } from "./errors";
import { CONTENT_SELECTORS, REMOVE_SELECTORS } from "./config";

/**
 * Pre-configured TurndownService singleton
 */
const turndownService = new TurndownService({
	headingStyle: "atx",
	codeBlockStyle: "fenced",
});
turndownService.use(gfm);

/**
 * Parse HTML to Markdown
 * Extracts main content, removes unwanted elements, and converts to markdown
 */
export const parseHtmlToMarkdown = (
	html: string,
): Effect.Effect<string, ParseError> =>
	Effect.try({
		try: () => {
			const { document } = parseHTML(html);

			// Replace math images with LaTeX
			document.querySelectorAll("img[alt]").forEach((img) => {
				const alt = img.getAttribute("alt");
				if (alt && /[a-zA-Z0-9\\^_=+]/.test(alt)) {
					img.replaceWith(`$$${alt}$$`);
				}
			});

			// Remove unwanted elements
			document.querySelectorAll(REMOVE_SELECTORS).forEach((el) => el.remove());

			// Find best content container
			let content: string | null = null;
			for (const selector of CONTENT_SELECTORS) {
				const el = document.querySelector(selector);
				if (el?.innerHTML) {
					content = el.innerHTML;
					break;
				}
			}

			if (!content) throw new Error("No content found");

			return turndownService.turndown(content);
		},
		catch: (e) =>
			new ParseError({
				message: e instanceof Error ? e.message : "Failed to parse HTML",
			}),
	});
