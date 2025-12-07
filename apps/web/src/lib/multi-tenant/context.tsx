"use client";

import { api } from "@ocw/backend/convex/_generated/api";
import { usePreloadedQuery, useQuery, type Preloaded } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import type React from "react";
import { createContext, useContext, useMemo } from "react";

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

	const siteConfig = usePreloadedQuery(
		initialSiteConfig,
	);

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

export const useSite = (): SiteContextType => {
	const context = useContext(SiteContext);
	return context;
};
