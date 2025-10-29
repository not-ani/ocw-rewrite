import { api } from "@ocw/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { ContributePageClient } from "./client";

export async function generateMetadata(): Promise<Metadata> {
	const subdomain = await extractSubdomain();

	if (!subdomain) {
		return {
			title: "Contribute",
			description: "Contribute to our platform",
		};
	}

	const siteConfig = await fetchQuery(api.site.getSiteConfig, {
		school: subdomain,
	});

	return {
		title: `Contribute | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
		description: `Contribute to ${siteConfig?.schoolName ?? "OpenCourseWare"} and help make education accessible to everyone.`,
	};
}

export default async function RouteComponent() {
	const subdomain = await extractSubdomain();

	if (!subdomain) {
		return null;
	}

	const siteConfig = await fetchQuery(api.site.getSiteConfig, {
		school: subdomain,
	});

	return <ContributePageClient siteConfig={siteConfig} />;
}
