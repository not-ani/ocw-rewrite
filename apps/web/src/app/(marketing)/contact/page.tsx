import { api } from "@ocw/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { ContactPageClient } from "./client";

export async function generateMetadata(): Promise<Metadata> {
	const subdomain = await extractSubdomain();

	if (!subdomain) {
		return {
			title: "Contact Us",
			description: "Get in touch with us",
		};
	}

	const siteConfig = await fetchQuery(api.site.getSiteConfig, {
		school: subdomain,
	});

	return {
		title: `Contact Us | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
		description: `Get in touch with the ${siteConfig?.schoolName ?? "OpenCourseWare"} team.`,
	};
}

export default async function Page() {
	const subdomain = await extractSubdomain();

	if (!subdomain) {
		return null;
	}

	const siteConfig = await fetchQuery(api.site.getSiteConfig, {
		school: subdomain,
	});

	return <ContactPageClient siteConfig={siteConfig} />;
}
