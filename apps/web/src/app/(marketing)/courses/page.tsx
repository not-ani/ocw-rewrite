import { preloadQuery } from "convex/nextjs";
import type { Metadata } from "next";

import { getPublicSiteConfig } from "@/lib/public-data";
import { api } from "@ocw/backend/convex/_generated/api";

import { CoursesPage } from "./client";
import { COURSES_PER_PAGE } from "./constants";

export async function getCoursesMetadata(
	school: string | null,
): Promise<Metadata> {
	if (!school) {
		return {
			title: "Courses",
			description: "Browse available courses",
		};
	}

	const siteConfig = await getPublicSiteConfig(school);

	return {
		title: `Courses | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
		description: `Browse all available courses at ${siteConfig?.schoolName ?? "OpenCourseWare"}. Find high-quality educational resources for free.`,
	};
}

export async function renderCoursesPage(school: string | null) {
	if (!school) {
		return <div>No subdomain found</div>;
	}

	// Preload initial courses data (page 1, no search)
	const preloadedCourses = await preloadQuery(api.courses.getPaginatedCourses, {
		page: 1,
		search: "",
		limit: COURSES_PER_PAGE,
		school,
	});

	return <CoursesPage subdomain={school} preloadedCourses={preloadedCourses} />;
}

export async function generateMetadata() {
	return getCoursesMetadata(null);
}

export default async function Page() {
	return renderCoursesPage(null);
}
