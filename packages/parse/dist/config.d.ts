export declare const ALLOWED_HOSTS: Set<string>;
export declare const FETCH_TIMEOUT_MS = 8000;
export declare const MAX_RESPONSE_SIZE: number;
export declare const CACHE_TTL = 300;
export declare const STALE_TTL = 3600;
export declare const REVALIDATE_LOCK_TTL = 30;
export declare const CACHE_PREFIX = "scrape:v1:";
export declare const LOCK_PREFIX = "scrape:lock:";
export declare const CONTENT_SELECTORS: readonly ["main", "article", ".doc-content", "[role=main]", ".content", "#content", "body"];
export declare const REMOVE_SELECTORS = "script, style, noscript, nav, footer, aside, header, .nav, .footer, .sidebar, [role=navigation], [aria-hidden=true]";
//# sourceMappingURL=config.d.ts.map