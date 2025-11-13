import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { isValidConvexId } from "@/lib/convex-utils";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { UnitPageClient } from "./client";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string; unitId: string }>;
}): Promise<Metadata> {
	const { unitId } = await params;
	const subdomain = await extractSubdomain();

	if (!subdomain || !isValidConvexId(unitId)) {
		return {
			title: "Unit",
			description: "Unit details",
		};
	}

	const unit = await fetchQuery(api.units.getById, {
		id: unitId as Id<"units">,
		school: subdomain,
	});

	const siteConfig = await fetchQuery(api.site.getSiteConfig, {
		school: subdomain,
	});

	if (!unit) {
		return {
			title: "Unit Not Found",
			description: "The requested unit could not be found",
		};
	}

	const course = await fetchQuery(api.courses.getCourseById, {
		courseId: unit.courseId,
		school: subdomain,
	});

	return {
		title: `${unit.name} | ${course?.name ?? "Course"} | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
		description:
			unit.description ||
			`Explore lessons in ${unit.name} from ${course?.name ?? "this course"}.`,
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

	return (
		<UnitPageClient unitId={unitId as Id<"units">} subdomain={subdomain} />
	);
}
