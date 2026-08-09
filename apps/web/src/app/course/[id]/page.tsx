import type { Metadata } from "next";

import { isValidConvexId } from "@/lib/convex-utils";
import { getPublicCourse, getPublicSiteConfig } from "@/lib/public-data";
import { protocol, rootDomain } from "@/lib/site";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";

import { CoursePageClient } from "./client";

// Cache course pages for 60 seconds
export const revalidate = 60;

export async function getCourseMetadata(
	school: string | null,
	id: string,
	baseUrl: string,
): Promise<Metadata> {
	const absoluteUrl = (path: string) => Promise.resolve(`${baseUrl}${path}`);
	if (!school || !isValidConvexId(id)) {
		const ogImageUrl = await absoluteUrl("/opengraph-image");
		return {
			title: "Course",
			description: "Course details",
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

	const [course, siteConfig] = await Promise.all([
		getPublicCourse(school, id as Id<"courses">),
		getPublicSiteConfig(school),
	]);

	if (!course) {
		const ogImageUrl = await absoluteUrl("/opengraph-image");
		return {
			title: "Course Not Found",
			description: "The requested course could not be found",
			openGraph: {
				title: "Course Not Found",
				description: "The requested course could not be found",
				images: [
					{
						url: ogImageUrl,
						width: 1200,
						height: 630,
						alt: "Course Not Found",
					},
				],
				type: "website",
			},
			twitter: {
				card: "summary_large_image",
				title: "Course Not Found",
				description: "The requested course could not be found",
				images: [ogImageUrl],
			},
		};
	}

	const title = `${course.name} | ${siteConfig?.schoolName ?? "OpenCourseWare"}`;
	const description =
		course.description ||
		`Learn about ${course.name} with free, high-quality resources.`;
	const ogImageUrl = await absoluteUrl(`/course/${id}/opengraph-image`);
	const url = await absoluteUrl(`/course/${id}`);

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			url,
			siteName: siteConfig?.schoolName ?? "OpenCourseWare",
			images: [
				{
					url: ogImageUrl,
					width: 1200,
					height: 630,
					alt: course.name,
				},
			],
			locale: "en_US",
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [ogImageUrl],
		},
	};
}

export function renderCoursePage(school: string | null, id: string) {
	if (!school) {
		return null;
	}

	if (!isValidConvexId(id)) {
		return null;
	}

	return <CoursePageClient courseId={id as Id<"courses">} subdomain={school} />;
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return getCourseMetadata(null, id, `${protocol}://${rootDomain}`);
}

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return renderCoursePage(null, id);
}
