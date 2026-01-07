/**
 * Type definitions for the markdown parsing service
 */

/**
 * Cached content structure stored in Redis
 */
export interface CachedContent {
	markdown: string;
	fetchedAt: number;
	etag?: string;
	lastModified?: string;
	contentHash: string;
}

/**
 * Result from fetch operation with conditional request support
 */
export interface FetchResult {
	html: string;
	etag?: string;
	lastModified?: string;
	notModified: boolean;
}

/**
 * Response data returned from the handler
 */
export interface ResponseData {
	markdown: string;
	cached: boolean;
	age?: number;
}
