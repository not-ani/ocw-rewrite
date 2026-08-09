"use client";

import { usePreloadedQuery, useQuery, type Preloaded } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { api } from "@ocw/backend/convex/_generated/api";

import { rootDomain } from "../site";

type SiteContextType = {
	siteConfig: FunctionReturnType<typeof api.site.getSiteConfig> | null;
	subdomain: string;
	user?: {
		isSiteAdmin: boolean;
	};
};

// Create a default context value to ensure context is never null
const defaultContextValue: SiteContextType = {
	siteConfig: null,
	subdomain: "",
	user: undefined,
};

export const SiteContext = createContext<SiteContextType>(defaultContextValue);

export const SiteContextProvider = ({
	children,
	subdomain,
	initialSiteConfig,
}: {
	children: React.ReactNode;
	subdomain: string | null;
	initialSiteConfig: Preloaded<typeof api.site.getSiteConfig>;
}) => {
	// We skip the query if subdomain is null, but the hook usage order remains constant
	const shouldSkip = !subdomain;

	const siteConfig = usePreloadedQuery(initialSiteConfig);

	const user = useQuery(
		api.permissions.getSiteUser,
		shouldSkip ? "skip" : { school: subdomain },
	);

	const contextValue = useMemo(
		() => ({
			siteConfig: siteConfig,
			subdomain: subdomain ?? "",
			user: user ? { isSiteAdmin: user.role === "admin" } : undefined,
		}),
		[siteConfig, subdomain, user],
	);

	return (
		<SiteContext.Provider value={contextValue}>{children}</SiteContext.Provider>
	);
};

function getBrowserSubdomain() {
	if (typeof window === "undefined") return null;
	const hostname = window.location.hostname;
	if (hostname.endsWith(".localhost")) return hostname.split(".")[0] ?? null;
	const rootHostname = rootDomain.split(":")[0];
	if (
		rootHostname &&
		hostname !== rootHostname &&
		hostname !== `www.${rootHostname}` &&
		hostname.endsWith(`.${rootHostname}`)
	) {
		return hostname.slice(0, -(rootHostname.length + 1));
	}
	return null;
}

/**
 * Supplies tenant context without server request APIs. Public routes remain
 * cacheable, while tenant data hydrates reactively from Convex in the browser.
 */
export function BrowserSiteContextProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [subdomain, setSubdomain] = useState<string | null>(null);
	useEffect(() => setSubdomain(getBrowserSubdomain()), []);
	const siteSchool = subdomain ?? "www";
	const siteConfig = useQuery(api.site.getSiteConfig, { school: siteSchool });
	const user = useQuery(
		api.permissions.getSiteUser,
		subdomain ? { school: subdomain } : "skip",
	);
	const contextValue = useMemo(
		() => ({
			siteConfig: siteConfig ?? null,
			subdomain: subdomain ?? "",
			user: user ? { isSiteAdmin: user.role === "admin" } : undefined,
		}),
		[siteConfig, subdomain, user],
	);

	return (
		<SiteContext.Provider value={contextValue}>{children}</SiteContext.Provider>
	);
}

export const useSite = (): SiteContextType => {
	const context = useContext(SiteContext);
	return context;
};
