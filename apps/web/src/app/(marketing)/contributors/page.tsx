import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { cacheLife } from "next/cache";

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
	"use cache";
	cacheLife("hours");

	if (!school) {
		return null;
	}

	const [siteConfig, contributors] = await Promise.all([
		getPublicSiteConfig(school),
		fetchQuery(api.site.getContributors, { school }),
	]);

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
