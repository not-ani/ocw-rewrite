import { ratelimit } from "@/lib/redis/rate-limit";
import * as cheerio from "cheerio";
import dns from "node:dns";
import net from "node:net";
import { NextResponse } from "next/server";
import TurndownService from "turndown";
// @ts-expect-error
import { gfm } from "turndown-plugin-gfm";

const dnsLookup = dns.promises.lookup;
//
// Helper: read allowlist from env
const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || "")
	.split(",")
	.map((h) => h.trim().toLowerCase())
	.filter(Boolean);

// Helper: check if host is allowed
function isHostAllowlisted(hostname: string) {
	if (ALLOWED_HOSTS.length === 0) {
		// If no allowlist configured, default to deny
		return false;
	}
	const h = hostname.toLowerCase();
	// exact match or subdomain match (e.g., allow example.com -> foo.example.com)
	return ALLOWED_HOSTS.some(
		(allowed) => h === allowed || h.endsWith(`.${allowed}`),
	);
}

// Helper: check if an IP is private / loopback / link-local / metadata
function isPrivateIp(ip: string): boolean {
	if (net.isIP(ip) === 4) {
		// IPv4 checks
		// 10.0.0.0/8
		if (ip.startsWith("10.")) return true;
		// 127.0.0.0/8 loopback
		if (ip.startsWith("127.")) return true;
		// 169.254.0.0/16 link-local
		if (ip.startsWith("169.254.")) return true;
		// 172.16.0.0/12
		const firstTwo = ip.split(".");
		const second = Number(firstTwo[1]);
		if (firstTwo[0] === "172" && second >= 16 && second <= 31) return true;
		// 192.168.0.0/16
		if (ip.startsWith("192.168.")) return true;
		// 100.64.0.0/10 carrier-grade NAT
		const first = Number(firstTwo[0]);
		const secondOct = Number(firstTwo[1]);
		if (first === 100 && secondOct >= 64 && secondOct <= 127) return true;
		// 198.18.0.0/15 benchmark/testing
		if (first === 198) {
			const sec = Number(firstTwo[1]);
			if (sec === 18 || sec === 19) return true;
		}
		// 0.0.0.0/8 (reserved)
		if (first === 0) return true;
		// 224.0.0.0/4 multicast and beyond (not routable)
		if (first >= 224) return true;
		// AWS metadata IP
		if (ip === "169.254.169.254") return true;
	} else if (net.isIP(ip) === 6) {
		// IPv6 checks: loopback ::1, unique local fc00::/7, link-local fe80::/10
		if (ip === "::1") return true;
		const lower = ip.toLowerCase();
		if (lower.startsWith("fe80:")) return true;
		if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // fc00::/7
		if (lower === "::" || lower === "0::0") return true;
	}
	return false;
}

async function ensureHostnameSafe(urlObj: URL) {
	const hostname = urlObj.hostname;
	// Basic host allowlist check
	if (!isHostAllowlisted(hostname)) {
		throw new Error("Host is not allowlisted");
	}

	// Resolve DNS to IP(s) and ensure none are private
	try {
		// Lookup all addresses (both IPv4 and IPv6)
		const results = await dnsLookup(hostname, { all: true });
		for (const r of results) {
			if (isPrivateIp(r.address)) {
				throw new Error("Resolved IP is private or reserved");
			}
		}
	} catch (err) {
		// If DNS resolution fails or yields private IPs, block
		throw new Error("DNS resolution failed or returned unsafe addresses");
	}
}

export async function GET(request: Request) {
	try {
		// Rate limiting by client IP (or anonymous)
		const ip =
			request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
			request.headers.get("x-real-ip") ||
			request.headers.get("client-ip") ||
			"anonymous";

		const rlRes = await ratelimit.limit(ip);
		if (!rlRes.success) {
			// Optionally return limit metadata
			return NextResponse.json(
				{
					error: "Too many requests",
					remaining: rlRes.remaining,
					reset: rlRes.reset,
				},
				{ status: 429 },
			);
		}

		const { searchParams } = new URL(request.url);
		const url = searchParams.get("url");

		if (!url) {
			return NextResponse.json(
				{ error: "URL parameter is required" },
				{ status: 400 },
			);
		}

		let urlObj: URL;
		try {
			urlObj = new URL(url);
		} catch (e) {
			return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
		}

		// Only allow http(s)
		if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
			return NextResponse.json(
				{ error: "Only http and https protocols are allowed" },
				{ status: 400 },
			);
		}

		// Ensure host is allowed and resolves to non-private IPs
		try {
			await ensureHostnameSafe(urlObj);
		} catch (err: any) {
			return NextResponse.json(
				{ error: "Blocked URL: " + (err?.message || "unsafe") },
				{ status: 400 },
			);
		}

		// Fetch the content
		const response = await fetch(url);
		if (!response.ok) {
			return NextResponse.json(
				{ error: "Failed to fetch URL" },
				{ status: 400 },
			);
		}

		const html = await response.text();

		const $ = cheerio.load(html);
		const mathImages = $("img[alt]");

		mathImages.each((_i, img) => {
			const alt = $(img).attr("alt");
			if (alt && /[a-zA-Z0-9\\^_=+]/.test(alt)) {
				$(img).replaceWith(`$$${alt}$$`);
			}
		});

		// Remove unwanted elements
		$("script, style, noscript, link, meta, head").remove();

		// Get content from main, .doc-content, or body
		const content =
			$("main").html() || $(".doc-content").html() || $("body").html() || "";

		const turndownService = new TurndownService();
		turndownService.use(gfm);

		const markdown = turndownService.turndown(content);

		return NextResponse.json({ markdown });
	} catch (_error) {
		return NextResponse.json(
			{ error: "Invalid URL or fetch failed" },
			{ status: 400 },
		);
	}
}
