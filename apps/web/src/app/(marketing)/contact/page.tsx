import type { Metadata } from "next";

import { getPublicSiteConfig } from "@/lib/public-data";

import { ContactPageClient } from "./client";

export async function getContactMetadata(
	school: string | null,
): Promise<Metadata> {
	if (!school) {
		return {
			title: "Contact Us",
			description: "Get in touch with us",
		};
	}

	const siteConfig = await getPublicSiteConfig(school);

	return {
		title: `Contact Us | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
		description: `Get in touch with the ${siteConfig?.schoolName ?? "OpenCourseWare"} team.`,
	};
}

export async function renderContactPage(school: string | null) {
	if (!school) {
		return null;
	}

	const siteConfig = await getPublicSiteConfig(school);

	return <ContactPageClient siteConfig={siteConfig} />;
}

export async function generateMetadata() {
	return getContactMetadata(null);
}

export default async function Page() {
	return renderContactPage(null);
}
