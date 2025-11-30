import "server-only";
import { headers } from "next/headers";

export async function extractSubdomain(): Promise<string | null> {
	const headersList = await headers();
	const host = headersList.get("host") || "";
	const hostname = host.split(":")[0];

	// Handle localhost subdomains (e.g., creek.localhost)
	if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
		if (hostname.includes(".localhost")) {
			return hostname.split(".")[0];
		}
		return null;
	}

	// For production, extract subdomain from hostname
	// This assumes subdomain.domain.com format
	const parts = hostname.split(".");
	if (parts.length >= 3) {
		// Check if it's a subdomain (not www)
		if (parts[0] !== "www") {
			return parts[0];
		}
	}

	return null;
}
