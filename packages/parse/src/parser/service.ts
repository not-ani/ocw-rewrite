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
turndownService.use(gfm as unknown as (service: TurndownService) => void);

// Pre-compile regex for image processing
const LATEX_PATTERN = /[a-zA-Z0-9\\^_=+]/;

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
        const { document } = parseHTML(html) as unknown as { document: Document };

        // 1. Process Images
        const images = document.querySelectorAll("img[alt]");
        images.forEach((img) => {
          const alt = (img as unknown as Element).getAttribute("alt");
          if (alt && LATEX_PATTERN.test(alt)) {
            (img as unknown as Element).replaceWith(`$$${alt}$$`);
          }
        });

        // 2. Remove Junk
        document.querySelectorAll(REMOVE_SELECTORS).forEach((el) => {
          (el as unknown as Element).remove();
        });

        // 3. Extract Content
        let content: string | null = null;
        for (const selector of CONTENT_SELECTORS) {
          const el = document.querySelector(selector) as unknown as Element | null;
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