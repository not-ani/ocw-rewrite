import type { Metadata } from "next";

import { getPublicSiteConfig } from "@/lib/public-data";

import { ContributePageClient } from "./client";

export async function getContributeMetadata(
	school: string | null,
): Promise<Metadata> {
	if (!school) {
		return {
			title: "Contribute",
			description: "Contribute to our platform",
		};
	}

	const siteConfig = await getPublicSiteConfig(school);

	return {
		title: `Contribute | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
		description: `Contribute to ${siteConfig?.schoolName ?? "OpenCourseWare"} and help make education accessible to everyone.`,
	};
}

export async function renderContributePage(school: string | null) {
	if (!school) {
		return null;
	}

	const siteConfig = await getPublicSiteConfig(school);

	return <ContributePageClient siteConfig={siteConfig} />;
}

export async function generateMetadata() {
	return getContributeMetadata(null);
}

export default async function RouteComponent() {
	return renderContributePage(null);
}
