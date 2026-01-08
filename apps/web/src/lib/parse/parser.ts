import { Effect } from "effect";
import { ParseError } from "./errors";
import { CONTENT_SELECTORS, REMOVE_SELECTORS } from "./config";

let turndownService: import("turndown").default | null = null;

const getTurndownService = async () => {
	if (!turndownService) {
		const [{ default: TurndownService }, { gfm }] = await Promise.all([
			import("turndown"),
			import("turndown-plugin-gfm"),
		]);
		turndownService = new TurndownService({
			headingStyle: "atx",
			codeBlockStyle: "fenced",
		});
		turndownService.use(gfm);
	}
	return turndownService;
};

export const parseHtmlToMarkdown = (
	html: string,
): Effect.Effect<string, ParseError> =>
	Effect.tryPromise({
		try: async () => {
			const { parseHTML } = await import("linkedom");
			const { document } = parseHTML(html);

			
			document.querySelectorAll("img[alt]").forEach((img) => {
				const alt = img.getAttribute("alt");
				if (alt && /[a-zA-Z0-9\\^_=+]/.test(alt)) {
					img.replaceWith(`$$${alt}$$`);
				}
			});

			
			document.querySelectorAll(REMOVE_SELECTORS).forEach((el) => el.remove());

			
			let content: string | null = null;
			for (const selector of CONTENT_SELECTORS) {
				const el = document.querySelector(selector);
				if (el?.innerHTML) {
					content = el.innerHTML;
					break;
				}
			}

			if (!content) throw new Error("No content found");

			const td = await getTurndownService();
			return td.turndown(content);
		},
		catch: (e) =>
			new ParseError({
				message: e instanceof Error ? e.message : "Failed to parse HTML",
			}),
	});
