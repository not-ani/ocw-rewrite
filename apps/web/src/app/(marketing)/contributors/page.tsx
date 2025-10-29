import { api } from "@ocw/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { WritersTableClient } from "./client";

export async function generateMetadata(): Promise<Metadata> {
	const subdomain = await extractSubdomain();

	if (!subdomain) {
		return {
			title: "Contributors",
			description: "Meet our contributors",
		};
	}

	const siteConfig = await fetchQuery(api.site.getSiteConfig, {
		school: subdomain,
	});

	return {
		title: `Contributors | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
		description: `Meet the contributors who make ${siteConfig?.schoolName ?? "OpenCourseWare"} possible.`,
	};
}

export default async function WritersTable() {
	const subdomain = await extractSubdomain();

	if (!subdomain) {
		return null;
	}

	const siteConfig = await fetchQuery(api.site.getSiteConfig, {
		school: subdomain,
	});

	return <WritersTableClient siteConfig={siteConfig} />;
}
