/**
 * Configuration constants for the markdown parsing service
 */

export const ALLOWED_HOSTS = new Set(
	(process.env.ALLOWED_HOSTS || "")
		.split(",")
		.map((h) => h.trim().toLowerCase())
		.filter(Boolean),
);

export const FETCH_TIMEOUT_MS = 8_000;
export const MAX_RESPONSE_SIZE = 5 * 1024 * 1024; // 5MB

// Cache TTLs (in seconds)
export const CACHE_TTL = 300; // 5 min - serve cached content
export const STALE_TTL = 3600; // 1 hour - max age before hard refresh required
export const REVALIDATE_LOCK_TTL = 30; // 30s - lock duration for background revalidation

// Redis key prefixes
export const CACHE_PREFIX = "scrape:v1:";
export const LOCK_PREFIX = "scrape:lock:";

// Content selectors (in order of preference)
export const CONTENT_SELECTORS = [
	"main",
	"article",
	".doc-content",
	"[role=main]",
	".content",
	"#content",
	"body",
] as const;

// Selectors for elements to remove from HTML
export const REMOVE_SELECTORS =
	"script, style, noscript, nav, footer, aside, header, .nav, .footer, .sidebar, [role=navigation], [aria-hidden=true]";
