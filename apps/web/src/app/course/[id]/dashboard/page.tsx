import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { getAuthToken } from "@/lib/auth";
import { isValidConvexId } from "@/lib/convex-utils";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { DashboardPageClient } from "./client";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	const subdomain = await extractSubdomain();
	const token = await getAuthToken();

	if (!subdomain || !isValidConvexId(id) || !token) {
		return {
			title: "Course Dashboard",
			description: "Manage your course content",
		};
	}

	try {
		const [course, siteConfig] = await Promise.all([
			fetchQuery(
				api.courses.getCourseById,
				{
					courseId: id as Id<"courses">,
					school: subdomain,
				},
				{ token },
			),
			fetchQuery(api.site.getSiteConfig, {
				school: subdomain,
			}),
		]);

		if (!course) {
			return {
				title: "Course Dashboard",
				description: "Manage your course content",
			};
		}

		return {
			title: `Dashboard - ${course.name} | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
			description: `Manage content for ${course.name}. Edit units, lessons, and course settings.`,
		};
	} catch {
		return {
			title: "Course Dashboard",
			description: "Manage your course content",
		};
	}
}

export default async function Dashboard({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const _token = await getAuthToken();
	const subdomain = await extractSubdomain();

	if (!subdomain) {
		return null;
	}

	if (!isValidConvexId(id)) {
		return null;
	}

	const courseId = id as Id<"courses">;

	return <DashboardPageClient courseId={courseId} subdomain={subdomain} />;
}
