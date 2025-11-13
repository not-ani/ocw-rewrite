import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { isValidConvexId } from "@/lib/convex-utils";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { LessonPageClient } from "./client";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string; unitId: string; lessonId: string }>;
}): Promise<Metadata> {
	const { id, unitId, lessonId } = await params;
	const subdomain = await extractSubdomain();

	if (
		!subdomain ||
		!isValidConvexId(lessonId) ||
		!isValidConvexId(unitId) ||
		!isValidConvexId(id)
	) {
		return {
			title: "Lesson",
			description: "View and study this lesson",
		};
	}

	try {
		const [lessonData, unit, course, siteConfig] = await Promise.all([
			fetchQuery(api.lesson.getLessonById, {
				id: lessonId as Id<"lessons">,
				school: subdomain,
			}),
			fetchQuery(api.units.getById, {
				id: unitId as Id<"units">,
				school: subdomain,
			}),
			fetchQuery(api.courses.getCourseById, {
				courseId: id as Id<"courses">,
				school: subdomain,
			}),
			fetchQuery(api.site.getSiteConfig, {
				school: subdomain,
			}),
		]);

		const lessonName = lessonData?.lesson?.name || "Lesson";
		const unitName = unit?.name || "Unit";
		const courseName = course?.name || "Course";

		return {
			title: `${lessonName} | ${unitName} | ${courseName} | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
			description: `Study ${lessonName} from ${unitName} in ${courseName}. Free educational resources at ${siteConfig?.schoolName ?? "OpenCourseWare"}.`,
		};
	} catch {
		return {
			title: "Lesson",
			description: "View and study this lesson",
		};
	}
}

export default async function Page({
	params,
}: {
	params: Promise<{ id: string; unitId: string; lessonId: string }>;
}) {
	const { id, lessonId } = await params;
	const subdomain = await extractSubdomain();

	if (!subdomain) {
		return null;
	}

	// Validate IDs before passing to Convex
	if (!isValidConvexId(id) || !isValidConvexId(lessonId)) {
		return null;
	}

	return (
		<LessonPageClient
			courseId={id as Id<"courses">}
			lessonId={lessonId as Id<"lessons">}
			subdomain={subdomain}
		/>
	);
}
