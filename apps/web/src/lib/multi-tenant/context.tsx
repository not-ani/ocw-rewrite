"use client";
import React, { useContext } from "react";
import { createContext } from "react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { useQuery } from "convex/react";

type SiteContext = {
  siteConfig: FunctionReturnType<typeof api.site.getSiteConfig> | null;
  subdomain: string;
  user?: {
    isSiteAdmin: boolean;
  };
};

export const SiteContext = createContext<SiteContext | null>(null);

export const SiteContextProvider = ({
  children,
  subdomain,
}: {
  children: React.ReactNode;
  subdomain: string | null;
}) => {
  if (!subdomain) {
    return <>{children}</>;
  }
  const siteConfig = useQuery(api.site.getSiteConfig, {
    school: subdomain,
  });

  const user = useQuery(api.permissions.getSiteUser, {
    school: subdomain,
  });

  return (
    <SiteContext.Provider
      value={{
        siteConfig: siteConfig ?? null,
        subdomain,
        user: user ? { isSiteAdmin: user.role === "admin" } : undefined,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useSiteContext must be used within a SiteContextProvider");
  }
  return context;
};

