


export interface CachedContent {
	markdown: string;
	fetchedAt: number;
	etag?: string;
	lastModified?: string;
	contentHash: string;
}


export interface FetchResult {
	html: string;
	etag?: string;
	lastModified?: string;
	notModified: boolean;
}


export interface ResponseData {
	markdown: string;
	cached: boolean;
	age?: number;
}
