import { SiteContentClient } from "./_client/client";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Site Content | OpenCourseWare",
  description: "Manage site content and configuration",
  robots: "noindex, nofollow",
};

export default async function SiteContentPage() {
  const school = await extractSubdomain();

  if (!school) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-muted-foreground">
            Could not determine school subdomain
          </p>
        </div>
      </div>
    );
  }

  const preloadedSiteConfig = await preloadQuery(api.site.getSiteConfig, {
    school,
  });

  return (
    <SiteContentClient
      school={school}
      preloadedSiteConfig={preloadedSiteConfig}
    />
  );
}
