import { Context, Effect, Layer } from "effect";
import { ParseError } from "../errors";
declare const ParserService_base: Context.TagClass<ParserService, "ParserService", {
    readonly parseHtmlToMarkdown: (html: string) => Effect.Effect<string, ParseError>;
}>;
export declare class ParserService extends ParserService_base {
}
export declare const ParserServiceLive: Layer.Layer<ParserService, never, never>;
export {};
//# sourceMappingURL=service.d.ts.map