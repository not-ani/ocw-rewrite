import { api } from "@ocw/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { SiteContentClient } from "./_client/client";
import { Authenticated } from "convex/react";

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

	const token = await getAuthToken();

	if (!token) {
		redirect("/unauthorized");
	}

	const isSiteAdmin = await fetchQuery(
		api.admin.isSiteAdmin,
		{ school },
		{ token },
	);

	if (!isSiteAdmin) {
		redirect("/unauthorized");
	}

	return <SiteContentClient school={school} />;
}
