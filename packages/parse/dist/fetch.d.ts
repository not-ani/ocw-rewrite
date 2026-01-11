import { Effect } from "effect";
import { FetchError } from "./errors";
import type { FetchResult } from "./types";
export declare const fetchWithConditional: (url: string, cachedEtag?: string, cachedLastModified?: string) => Effect.Effect<FetchResult, FetchError>;
//# sourceMappingURL=fetch.d.ts.map