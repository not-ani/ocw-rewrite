import { Context, Effect, Layer } from "effect";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { parseHTML } from "linkedom";
import { ParseError } from "../errors";
import { CONTENT_SELECTORS, REMOVE_SELECTORS } from "../config";

// Pre-initialized singleton (module-level, created once on import)
const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});
turndownService.use(gfm);

// Pre-compile regex for image processing - match LaTeX-like formulas
// Requires at least one of: ^, _, \, or = with alphanumeric content
const LATEX_PATTERN = /[\^_\\]|[a-zA-Z0-9]+\s*[=+\-*/]\s*[a-zA-Z0-9]/;

export class ParserService extends Context.Tag("ParserService")<
  ParserService,
  {
    readonly parseHtmlToMarkdown: (html: string) => Effect.Effect<string, ParseError>;
  }
>() {}

export const ParserServiceLive = Layer.succeed(ParserService, {
  parseHtmlToMarkdown: (html: string) =>
    Effect.try({
      try: () => {
        const { document } = parseHTML(html);

        // 1. Process Images - convert LaTeX images to inline LaTeX
        const images = document.querySelectorAll("img[alt]");
        images.forEach((img: Element) => {
          const alt = img.getAttribute("alt");
          if (alt && LATEX_PATTERN.test(alt)) {
            img.replaceWith(`$$${alt}$$`);
          }
        });

        // 2. Remove Junk
        document.querySelectorAll(REMOVE_SELECTORS).forEach((el: Element) => {
          el.remove();
        });

        // 3. Extract Content
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
      catch: (error) =>
        new ParseError({
          message: error instanceof Error ? error.message : "Parse failed",
        }),
    }),
});