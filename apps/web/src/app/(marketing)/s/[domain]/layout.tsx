import { preloadQuery } from "convex/nextjs";

import { SiteContextProvider } from "@/lib/multi-tenant/context";
import { getPublicSites } from "@/lib/public-data";

export async function generateStaticParams() {
	const sites = await getPublicSites();
	return sites.map(({ school }) => ({ domain: school }));
}
import { api } from "@ocw/backend/convex/_generated/api";

export default async function TenantLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ domain: string }>;
}) {
	const { domain } = await params;
	const siteConfig = await preloadQuery(api.site.getSiteConfig, {
		school: domain,
	});

	return (
		<SiteContextProvider initialSiteConfig={siteConfig} subdomain={domain}>
			{children}
		</SiteContextProvider>
	);
}
