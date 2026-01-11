export interface CachedContent {
    readonly markdown: string;
    readonly fetchedAt: number;
    readonly etag?: string;
    readonly lastModified?: string;
    readonly contentHash: string;
}
export interface FetchResult {
    readonly html: string;
    readonly etag?: string;
    readonly lastModified?: string;
    readonly notModified: boolean;
}
export interface ResponseData {
    readonly markdown: string;
    readonly cached: boolean;
    readonly age?: number;
}
//# sourceMappingURL=types.d.ts.map