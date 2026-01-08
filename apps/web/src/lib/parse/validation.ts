import { Effect } from "effect";
import dns from "node:dns";
import net from "node:net";
import { BlockedHostError, InvalidUrlError } from "./errors";
import { ALLOWED_HOSTS } from "./config";


const ipv4ToInt = (ip: string): number => {
	const p = ip.split(".");
	return ((+p[0] << 24) | (+p[1] << 16) | (+p[2] << 8) | +p[3]) >>> 0;
};


const PRIVATE_IPV4_CIDRS: [number, number][] = [
	[0x0a000000, 0xff000000], 
	[0x7f000000, 0xff000000], 
	[0xa9fe0000, 0xffff0000], 
	[0xac100000, 0xfff00000], 
	[0xc0a80000, 0xffff0000], 
	[0x64400000, 0xffc00000], 
	[0xc6120000, 0xfffe0000], 
	[0x00000000, 0xff000000], 
];


const isPrivateIp = (ip: string): boolean => {
	const version = net.isIP(ip);
	if (version === 4) {
		const ipInt = ipv4ToInt(ip);
		if (ipInt >>> 24 >= 224) return true; 
		for (const [value, mask] of PRIVATE_IPV4_CIDRS) {
			if ((ipInt & mask) === value) return true;
		}
		return false;
	}
	if (version === 6) {
		const l = ip.toLowerCase();
		return (
			l === "::1" ||
			l === "::" ||
			l.startsWith("fe80:") ||
			l.startsWith("fc") ||
			l.startsWith("fd")
		);
	}
	return true; 
};


const isHostAllowlisted = (hostname: string): boolean => {
	if (ALLOWED_HOSTS.size === 0) return false;
	const h = hostname.toLowerCase();
	if (ALLOWED_HOSTS.has(h)) return true;
	for (const allowed of ALLOWED_HOSTS) {
		if (h.endsWith(`.${allowed}`)) return true;
	}
	return false;
};


export const parseAndValidateUrl = (
	requestUrl: string,
): Effect.Effect<URL, InvalidUrlError> =>
	Effect.try({
		try: () => {
			const { searchParams } = new URL(requestUrl);
			const url = searchParams.get("url");
			if (!url) throw new Error("URL parameter is required");
			const urlObj = new URL(url);
			if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
				throw new Error("Only http and https protocols are allowed");
			}
			return urlObj;
		},
		catch: (e) =>
			new InvalidUrlError({
				message: e instanceof Error ? e.message : "Invalid URL",
			}),
	});


export const validateHostSecurity = (
	urlObj: URL,
): Effect.Effect<void, BlockedHostError> =>
	Effect.gen(function* () {
		if (!isHostAllowlisted(urlObj.hostname)) {
			return yield* Effect.fail(
				new BlockedHostError({
					host: urlObj.hostname,
					reason: "Host is not allowlisted",
				}),
			);
		}

		const results = yield* Effect.tryPromise({
			try: () => dns.promises.lookup(urlObj.hostname, { all: true }),
			catch: () =>
				new BlockedHostError({
					host: urlObj.hostname,
					reason: "DNS resolution failed",
				}),
		});

		for (const r of results) {
			if (isPrivateIp(r.address)) {
				return yield* Effect.fail(
					new BlockedHostError({
						host: urlObj.hostname,
						reason: `Resolved IP is private (${r.address})`,
					}),
				);
			}
		}
	});
