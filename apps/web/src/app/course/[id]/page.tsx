import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { isValidConvexId } from "@/lib/convex-utils";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { CoursePageClient } from "./client";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	const subdomain = await extractSubdomain();

	if (!subdomain || !isValidConvexId(id)) {
		return {
			title: "Course",
			description: "Course details",
		};
	}

	const course = await fetchQuery(api.courses.getCourseById, {
		courseId: id as Id<"courses">,
		school: subdomain,
	});

	const siteConfig = await fetchQuery(api.site.getSiteConfig, {
		school: subdomain,
	});

	if (!course) {
		return {
			title: "Course Not Found",
			description: "The requested course could not be found",
		};
	}

	return {
		title: `${course.name} | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
		description: course.description || `Learn about ${course.name} with free, high-quality resources.`,
	};
}

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const subdomain = await extractSubdomain();
	if (!subdomain) {
		return null;
	}

	if (!isValidConvexId(id)) {
		return null;
	}

	const preloadedCourse = await preloadQuery(
		api.courses.getCourseWithUnitsAndLessons,
		{
			id: id as Id<"courses">,
			school: subdomain,
		},
	);

	return <CoursePageClient preloadedCourse={preloadedCourse} />;
}
