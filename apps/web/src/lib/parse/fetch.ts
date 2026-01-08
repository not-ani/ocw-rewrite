import { Effect } from "effect";
import { FetchError } from "./errors";
import { FetchResult } from "./types";
import { FETCH_TIMEOUT_MS, MAX_RESPONSE_SIZE } from "./config";


export const fetchWithConditional = (
	url: string,
	cachedEtag?: string,
	cachedLastModified?: string,
): Effect.Effect<FetchResult, FetchError> =>
	Effect.tryPromise({
		try: async () => {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

			try {
				const headers: Record<string, string> = {
					"User-Agent": "Mozilla/5.0 (compatible; Scraper/1.0)",
					Accept: "text/html,application/xhtml+xml",
				};

				
				if (cachedEtag) headers["If-None-Match"] = cachedEtag;
				if (cachedLastModified)
					headers["If-Modified-Since"] = cachedLastModified;

				const response = await fetch(url, {
					signal: controller.signal,
					headers,
				});

				
				if (response.status === 304) {
					return { html: "", notModified: true };
				}

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}

				const contentLength = response.headers.get("content-length");
				if (contentLength && +contentLength > MAX_RESPONSE_SIZE) {
					throw new Error("Response too large");
				}

				const reader = response.body?.getReader();
				if (!reader) throw new Error("No response body");

				const chunks: Uint8Array[] = [];
				let totalSize = 0;

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					totalSize += value.length;
					if (totalSize > MAX_RESPONSE_SIZE) {
						reader.cancel();
						throw new Error("Response too large");
					}
					chunks.push(value);
				}

				const html = new TextDecoder().decode(
					chunks.length === 1
						? chunks[0]
						: chunks.reduce((acc, chunk) => {
								const merged = new Uint8Array(acc.length + chunk.length);
								merged.set(acc);
								merged.set(chunk, acc.length);
								return merged;
							}, new Uint8Array()),
				);

				return {
					html,
					etag: response.headers.get("etag") || undefined,
					lastModified: response.headers.get("last-modified") || undefined,
					notModified: false,
				};
			} finally {
				clearTimeout(timeoutId);
			}
		},
		catch: (e) =>
			new FetchError({
				message: e instanceof Error ? e.message : "Failed to fetch URL",
			}),
	});
