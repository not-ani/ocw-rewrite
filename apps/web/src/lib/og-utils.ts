import "server-only";
import { headers } from "next/headers";
import { protocol, rootDomain } from "./site";

export async function getAbsoluteUrl(path: string): Promise<string> {
	const headersList = await headers();
	const host = headersList.get("host") || rootDomain;
	const protocolToUse = host.includes("localhost") ? "http" : protocol;

	return `${protocolToUse}://${host}${path}`;
}

