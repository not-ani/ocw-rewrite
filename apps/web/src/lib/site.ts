import { env } from "@/env";

export const protocol = env.NODE_ENV === "production" ? "https" : "http";

export const rootDomain = env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3001";

export function getTenantBaseUrl(domain: string) {
	return `${protocol}://${domain}.${rootDomain}`;
}
