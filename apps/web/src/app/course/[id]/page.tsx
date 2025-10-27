import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { preloadQuery } from "convex/nextjs";
import { isValidConvexId } from "@/lib/convex-utils";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { CoursePageClient } from "./client";

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
