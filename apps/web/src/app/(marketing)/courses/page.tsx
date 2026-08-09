import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { connection } from "next/server";
import { Suspense } from "react";

import { getPublicSiteConfig } from "@/lib/public-data";
import { api } from "@ocw/backend/convex/_generated/api";

import { CoursesPage, CoursesPageSkeleton } from "./client";
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

export function renderCoursesPage(school: string | null) {
	if (!school) {
		return <div>No subdomain found</div>;
	}

	return (
		<Suspense fallback={<CoursesPageSkeleton />}>
			<CoursesContent school={school} />
		</Suspense>
	);
}

async function CoursesContent({ school }: { school: string }) {
	await connection();
	const initialCourses = await getInitialCourses(school);

	return <CoursesPage initialCourses={initialCourses} subdomain={school} />;
}

async function getInitialCourses(school: string) {
	"use cache";
	cacheLife("hours");
	return fetchQuery(api.courses.getPaginatedCourses, {
		page: 1,
		search: "",
		limit: COURSES_PER_PAGE,
		school,
	});
}

export async function generateMetadata() {
	return getCoursesMetadata(null);
}

export default async function Page() {
	return renderCoursesPage(null);
}
