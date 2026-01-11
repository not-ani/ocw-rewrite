import { Effect } from "effect";
import { BlockedHostError, InvalidUrlError } from "./errors";
export declare const PRIVATE_IPV4_CIDRS: [number, number][];
export declare const isHostAllowlisted: (hostname: string) => Effect.Effect<boolean, BlockedHostError, never>;
export declare const parseAndValidateUrl: (requestUrl: string) => Effect.Effect<URL, InvalidUrlError>;
export declare const validateHostSecurity: (urlObj: URL) => Effect.Effect<void, BlockedHostError>;
//# sourceMappingURL=validation.d.ts.map