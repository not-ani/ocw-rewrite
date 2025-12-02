import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { isValidConvexId } from "@/lib/convex-utils";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { getAbsoluteUrl } from "@/lib/og-utils";
import { UnitPageClient } from "./client";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string; unitId: string }>;
}): Promise<Metadata> {
	const { id, unitId } = await params;
	const subdomain = await extractSubdomain();

	if (!subdomain || !isValidConvexId(unitId) || !isValidConvexId(id)) {
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

	const [course, unit, siteConfig] = await Promise.all([
		fetchQuery(api.courses.getCourseById, {
			courseId: id as Id<"courses">,
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

	const unitName = unit?.name || "Unit";
	const courseName = course?.name || "Course";

	const [url, ogImageUrl] = await Promise.all([
		getAbsoluteUrl(`/course/${id}/${unitId}/`),
		getAbsoluteUrl(`/course/${id}/${unitId}/opengraph-image`),
	]);

	return {
		title: `${unitName} | ${courseName} | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
		description: `Study ${unitName} in ${courseName}. Free educational resources at ${siteConfig?.schoolName ?? "OpenCourseWare"}.`,
		openGraph: {
			title: `${unitName} | ${courseName} | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
			description: `Study ${unitName} in ${courseName}. Free educational resources at ${siteConfig?.schoolName ?? "OpenCourseWare"}.`,
			url: url,
			siteName: siteConfig?.schoolName ?? "OpenCourseWare",
			images: [
				{
					url: ogImageUrl,
					width: 1200,
					height: 630,
					alt: unitName,
				},
			],
			locale: "en_US",
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: `${unitName} | ${courseName} | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
			description: `Study ${unitName} in ${courseName}. Free educational resources at ${siteConfig?.schoolName ?? "OpenCourseWare"}.`,
			images: [ogImageUrl],
		},
	};
}
export default async function Page({
	params,
}: {
	params: Promise<{ id: string; unitId: string }>;
}) {
	const { unitId } = await params;
	const subdomain = await extractSubdomain();
	if (!subdomain) {
		return null;
	}

	if (!isValidConvexId(unitId)) {
		return null;
	}

	return <UnitPageClient unitId={unitId as Id<"units">} />;
}
