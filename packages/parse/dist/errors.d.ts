declare const RateLimitedError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "RateLimitedError";
} & Readonly<A>;
export declare class RateLimitedError extends RateLimitedError_base<{
    remaining: number;
    reset: number;
}> {
}
declare const InvalidUrlError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "InvalidUrlError";
} & Readonly<A>;
export declare class InvalidUrlError extends InvalidUrlError_base<{
    message: string;
}> {
}
declare const BlockedHostError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "BlockedHostError";
} & Readonly<A>;
export declare class BlockedHostError extends BlockedHostError_base<{
    host: string;
    reason: string;
}> {
}
declare const FetchError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "FetchError";
} & Readonly<A>;
export declare class FetchError extends FetchError_base<{
    message: string;
    status?: number;
}> {
}
declare const ParseError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "ParseError";
} & Readonly<A>;
export declare class ParseError extends ParseError_base<{
    message: string;
}> {
}
declare const IPFormatError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "IPFormatError";
} & Readonly<A>;
export declare class IPFormatError extends IPFormatError_base<{
    readonly message: string;
    readonly input: string;
}> {
}
export type AppError = RateLimitedError | InvalidUrlError | BlockedHostError | FetchError | ParseError | IPFormatError;
export {};
//# sourceMappingURL=errors.d.ts.map