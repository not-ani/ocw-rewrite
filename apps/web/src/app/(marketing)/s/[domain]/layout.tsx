import { SiteContextProvider } from "@/lib/multi-tenant/context";
import { getPublicSiteConfig, getPublicSites } from "@/lib/public-data";

export async function generateStaticParams() {
	const sites = await getPublicSites();
	return sites.map(({ school }) => ({ domain: school }));
}
export default async function TenantLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ domain: string }>;
}) {
	const { domain } = await params;
	const siteConfig = await getPublicSiteConfig(domain);

	return (
		<SiteContextProvider initialSiteConfig={siteConfig} subdomain={domain}>
			{children}
		</SiteContextProvider>
	);
}
