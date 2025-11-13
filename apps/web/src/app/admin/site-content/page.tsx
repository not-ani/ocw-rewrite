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

	return <SiteContentClient school={school} />;
}
