/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import { Context, Effect, Layer } from "effect";
import { ParseError } from "../errors";
import { CONTENT_SELECTORS, REMOVE_SELECTORS } from "../config";

export class ParserService extends Context.Tag("ParserService")<
  ParserService,
  {
    readonly parseHtmlToMarkdown: (html: string) => Effect.Effect<string, ParseError>;
  }
>() {}

export const ParserServiceLive = Layer.effect(
  ParserService,
  Effect.gen(function* () {
    // Dynamic Imports
    const [TurndownModule, GfmModule, { parseHTML }] = yield* Effect.all([
      Effect.promise(() => import("turndown")),
      Effect.promise(() => import("turndown-plugin-gfm")),
      Effect.promise(() => import("linkedom")),
    ]);

    const turndownService = new TurndownModule.default({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
    });
    turndownService.use(GfmModule.gfm);

    return {
      parseHtmlToMarkdown: (html: string) =>
        Effect.try({
          try: () => {
            const { document } = parseHTML(html) as any;

            // 1. Process Images
            const images = document.querySelectorAll("img[alt]");
            images.forEach((img: any) => {
              const alt = img.getAttribute("alt");
              if (alt && /[a-zA-Z0-9\\^_=+]/.test(alt)) {
                img.replaceWith(`$$${alt}$$`);
              }
            });

            // 2. Remove Junk
            document.querySelectorAll(REMOVE_SELECTORS).forEach((el: any) => {
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
    };
  })
);