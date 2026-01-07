import { createHash } from "node:crypto";
import { CACHE_TTL, STALE_TTL } from "./config";

/**
 * Hash a URL to create a cache key
 */
export const hashUrl = (url: string): string =>
	createHash("sha256").update(url).digest("hex").slice(0, 16);

/**
 * Hash content to detect changes
 */
export const hashContent = (content: string): string =>
	createHash("md5").update(content).digest("hex");

/**
 * Check if cached content is stale (older than CACHE_TTL)
 */
export const isStale = (fetchedAt: number): boolean =>
	Date.now() - fetchedAt > CACHE_TTL * 1000;

/**
 * Check if cached content is expired (older than STALE_TTL)
 */
export const isExpired = (fetchedAt: number): boolean =>
	Date.now() - fetchedAt > STALE_TTL * 1000;

/**
 * Extract client IP from request headers
 */
export const getClientIp = (request: Request): string =>
	request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
	request.headers.get("x-real-ip") ||
	request.headers.get("client-ip") ||
	"anonymous";
