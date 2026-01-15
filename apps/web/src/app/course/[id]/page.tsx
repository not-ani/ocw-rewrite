import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { isValidConvexId } from "@/lib/convex-utils";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { getAbsoluteUrl } from "@/lib/og-utils";
import { CoursePageClient } from "./client";

// Cache course pages for 60 seconds
export const revalidate = 60;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	const subdomain = await extractSubdomain();

	if (!subdomain || !isValidConvexId(id)) {
		const ogImageUrl = await getAbsoluteUrl("/opengraph-image");
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

	const course = await fetchQuery(api.courses.getCourseById, {
		courseId: id as Id<"courses">,
		school: subdomain,
	});

	const siteConfig = await fetchQuery(api.site.getSiteConfig, {
		school: subdomain,
	});

	if (!course) {
		const ogImageUrl = await getAbsoluteUrl("/opengraph-image");
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
	const ogImageUrl = await getAbsoluteUrl(`/course/${id}/opengraph-image`);
	const url = await getAbsoluteUrl(`/course/${id}`);

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

	return (
		<CoursePageClient courseId={id as Id<"courses">} subdomain={subdomain} />
	);
}
