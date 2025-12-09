import "server-only";
import { headers } from "next/headers";
import { protocol } from "../site";

export async function extractSubdomain(): Promise<string | null> {
	const headersList = await headers();

	const host =
		headersList.get("x-forwarded-host") ||
		headersList.get("host") ||
		parseHostFromReferer(headersList.get("referer")) ||
		"";

	const hostname = host.split(":")[0];
	const parts = hostname.split(".");

	if (parts.length === 2 && parts[1] === "localhost") {
		if (parts[0] !== "www") {
			return parts[0];
		}
		return parts[0];
	}

	if (parts.length >= 3) {
		if (parts[0] !== "www") {
			return parts[0];
		}
	}

	return null;
}

function parseHostFromReferer(referer: string | null): string | null {
	if (!referer) return null;
	try {
		const url = new URL(referer);
		return url.host;
	} catch {
		return null;
	}
}

export async function getBaseUrl(): Promise<string> {
	const headersList = await headers();
	const host =
		headersList.get("x-forwarded-host") ||
		headersList.get("host") ||
		process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
		"localhost:3001";
	const protocolToUse = host.includes("localhost") ? "http" : protocol;
	return `${protocolToUse}://${host}`;
}