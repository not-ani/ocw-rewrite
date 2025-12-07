import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { isValidConvexId } from "@/lib/convex-utils";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { getAbsoluteUrl } from "@/lib/og-utils";
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
		const ogImageUrl = await getAbsoluteUrl("/opengraph-image");
		return {
			title: "Lesson",
			description: "View and study this lesson",
			openGraph: {
				title: "Course",
				description: "Course details",
				images: [
					{
						url: ogImageUrl,
						width: 1200,
						height: 630,
						alt: "Course",
					},
				],
				type: "website",
			},
			twitter: {
				card: "summary_large_image",
				title: "Course",
				description: "Course details",
				images: [ogImageUrl],
			},
		};
	}

	const [course, lesson, unit, siteConfig] = await Promise.all([
		fetchQuery(api.courses.getCourseById, {
			courseId: id as Id<"courses">,
			school: subdomain,
		}),
		fetchQuery(api.lesson.getLessonById, {
			id: lessonId as Id<"lessons">,
			school: subdomain,
		}),
		fetchQuery(api.units.getById, {
			id: unitId as Id<"units">,
			school: subdomain,
		}),
		fetchQuery(api.site.getSiteConfig, {
			school: subdomain,
		}),
	]);

	const lessonName = lesson?.lesson?.name || "Lesson";
	const unitName = unit?.name || "Unit";
	const courseName = course?.name || "Course";

	const [url, ogImageUrl] = await Promise.all([
		getAbsoluteUrl(`/course/${id}/${unitId}/${lessonId}`),
		getAbsoluteUrl(`/course/${id}/${unitId}/${lessonId}/opengraph-image`),
	]);

	return {
		title: `${lessonName} | ${unitName} | ${courseName} | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
		description: `Study ${lessonName} from ${unitName} in ${courseName}. Free educational resources at ${siteConfig?.schoolName ?? "OpenCourseWare"}.`,
		openGraph: {
			title: `${lessonName} | ${unitName} | ${courseName} | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
			description: `Study ${lessonName} from ${unitName} in ${courseName}. Free educational resources at ${siteConfig?.schoolName ?? "OpenCourseWare"}.`,
			url: url,
			siteName: siteConfig?.schoolName ?? "OpenCourseWare",
			images: [
				{
					url: ogImageUrl,
					width: 1200,
					height: 630,
					alt: lessonName,
				},
			],
			locale: "en_US",
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: `${lessonName} | ${unitName} | ${courseName} | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
			description: `Study ${lessonName} from ${unitName} in ${courseName}. Free educational resources at ${siteConfig?.schoolName ?? "OpenCourseWare"}.`,
			images: [ogImageUrl],
		},
	};
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

	// Preload lesson data
	const preloadedLesson = await preloadQuery(api.lesson.getLessonById, {
		id: lessonId as Id<"lessons">,
		school: subdomain,
	});

	return (
		<LessonPageClient
			courseId={id as Id<"courses">}
			subdomain={subdomain}
			preloadedLesson={preloadedLesson}
		/>
	);
}
