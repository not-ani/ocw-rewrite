import { preloadQuery } from "convex/nextjs";
import type { Metadata } from "next";

import { isValidConvexId } from "@/lib/convex-utils";
import {
	getPublicCourse,
	getPublicLesson,
	getPublicSiteConfig,
	getPublicUnit,
} from "@/lib/public-data";
import { protocol, rootDomain } from "@/lib/site";
import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";

import { LessonPageClient } from "./client";

// Cache lesson pages for 60 seconds
export const revalidate = 60;

export async function getLessonMetadata(
	school: string | null,
	id: string,
	unitId: string,
	lessonId: string,
	baseUrl: string,
): Promise<Metadata> {
	const absoluteUrl = (path: string) => Promise.resolve(`${baseUrl}${path}`);
	if (
		!school ||
		!isValidConvexId(lessonId) ||
		!isValidConvexId(unitId) ||
		!isValidConvexId(id)
	) {
		const ogImageUrl = await absoluteUrl("/opengraph-image");
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
		getPublicCourse(school, id as Id<"courses">),
		getPublicLesson(school, lessonId as Id<"lessons">),
		getPublicUnit(school, unitId as Id<"units">),
		getPublicSiteConfig(school),
	]);

	const lessonName = lesson?.lesson.name ?? "Lesson";
	const unitName = unit?.name ?? "Unit";
	const courseName = course?.name ?? "Course";

	const [url, ogImageUrl] = await Promise.all([
		absoluteUrl(`/course/${id}/${unitId}/${lessonId}`),
		absoluteUrl(`/course/${id}/${unitId}/${lessonId}/opengraph-image`),
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

export async function renderLessonPage(
	school: string | null,
	id: string,
	lessonId: string,
) {
	if (!school) {
		return null;
	}

	// Validate IDs before passing to Convex
	if (!isValidConvexId(id) || !isValidConvexId(lessonId)) {
		return null;
	}

	// Preload lesson data
	const preloadedLesson = await preloadQuery(api.lesson.getPublicLessonById, {
		id: lessonId as Id<"lessons">,
		school,
	});

	return (
		<LessonPageClient
			courseId={id as Id<"courses">}
			subdomain={school}
			preloadedLesson={preloadedLesson}
		/>
	);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string; unitId: string; lessonId: string }>;
}) {
	const { id, unitId, lessonId } = await params;
	return getLessonMetadata(
		null,
		id,
		unitId,
		lessonId,
		`${protocol}://${rootDomain}`,
	);
}

export default async function Page({
	params,
}: {
	params: Promise<{ id: string; unitId: string; lessonId: string }>;
}) {
	const { id, lessonId } = await params;
	return renderLessonPage(null, id, lessonId);
}
