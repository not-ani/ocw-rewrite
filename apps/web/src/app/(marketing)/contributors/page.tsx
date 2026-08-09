import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";

import { getPublicSiteConfig } from "@/lib/public-data";
import { api } from "@ocw/backend/convex/_generated/api";

import { WritersTableClient } from "./client";

export async function getContributorsMetadata(
	school: string | null,
): Promise<Metadata> {
	if (!school) {
		return {
			title: "Contributors",
			description: "Meet our contributors",
		};
	}

	const siteConfig = await getPublicSiteConfig(school);

	return {
		title: `Contributors | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
		description: `Meet the contributors who make ${siteConfig?.schoolName ?? "OpenCourseWare"} possible.`,
	};
}

export async function renderContributorsPage(school: string | null) {
	if (!school) {
		return null;
	}

	const siteConfig = await getPublicSiteConfig(school);
	const contributors = await fetchQuery(api.site.getContributors, {
		school,
	});

	return (
		<WritersTableClient siteConfig={siteConfig} contributors={contributors} />
	);
}

export async function generateMetadata() {
	return getContributorsMetadata(null);
}

export default async function WritersTable() {
	return renderContributorsPage(null);
}
