import { api } from "@ocw/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { Suspense } from "react";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { CoursesPage } from "./client";

export async function generateMetadata(): Promise<Metadata> {
	const subdomain = await extractSubdomain();

	if (!subdomain) {
		return {
			title: "Courses",
			description: "Browse available courses",
		};
	}

	const siteConfig = await fetchQuery(api.site.getSiteConfig, {
		school: subdomain,
	});

	return {
		title: `Courses | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
		description: `Browse all available courses at ${siteConfig?.schoolName ?? "OpenCourseWare"}. Find high-quality educational resources for free.`,
	};
}

export default async function Page() {
	const subdomain = await extractSubdomain();

	if (!subdomain) {
		return <div>No subdomain found</div>;
	}

	return (
		<Suspense>
			<CoursesPage subdomain={subdomain} />
		</Suspense>
	);
}
