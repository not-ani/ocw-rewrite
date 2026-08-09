import type { Metadata } from "next";

import { isValidConvexId } from "@/lib/convex-utils";
import {
	getPublicCourse,
	getPublicSiteConfig,
	getPublicUnit,
} from "@/lib/public-data";
import { protocol, rootDomain } from "@/lib/site";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";

import { UnitPageClient } from "./client";

export async function getUnitMetadata(
	school: string | null,
	id: string,
	unitId: string,
	baseUrl: string,
): Promise<Metadata> {
	const absoluteUrl = (path: string) => Promise.resolve(`${baseUrl}${path}`);
	if (!school || !isValidConvexId(unitId) || !isValidConvexId(id)) {
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

	const [course, unit, siteConfig] = await Promise.all([
		getPublicCourse(school, id as Id<"courses">),
		getPublicUnit(school, unitId as Id<"units">),
		getPublicSiteConfig(school),
	]);

	const unitName = unit?.name || "Unit";
	const courseName = course?.name || "Course";

	const [url, ogImageUrl] = await Promise.all([
		absoluteUrl(`/course/${id}/${unitId}/`),
		absoluteUrl(`/course/${id}/${unitId}/opengraph-image`),
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
export function renderUnitPage(school: string | null, unitId: string) {
	if (!school) {
		return null;
	}

	if (!isValidConvexId(unitId)) {
		return null;
	}

	return <UnitPageClient unitId={unitId as Id<"units">} school={school} />;
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string; unitId: string }>;
}) {
	const { id, unitId } = await params;
	return getUnitMetadata(null, id, unitId, `${protocol}://${rootDomain}`);
}

export default async function Page({
	params,
}: {
	params: Promise<{ id: string; unitId: string }>;
}) {
	const { unitId } = await params;
	return renderUnitPage(null, unitId);
}
