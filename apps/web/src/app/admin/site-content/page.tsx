import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { SiteContentClient } from "./_client/client";

export default async function SiteContentPage() {
	const school = await extractSubdomain();

	if (!school) {
		return (
			<div className="p-6">
				<div className="text-center">
					<h1 className="font-bold text-2xl">Error</h1>
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
