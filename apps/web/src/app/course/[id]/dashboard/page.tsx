import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { preloadQuery } from "convex/nextjs";
import { getAuthToken } from "@/lib/auth";
import { isValidConvexId } from "@/lib/convex-utils";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { DashboardPageClient } from "./client";

export default async function Dashboard({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const token = await getAuthToken();
	const subdomain = await extractSubdomain();

	if (!subdomain) {
		return null;
	}

	if (!isValidConvexId(id)) {
		return null;
	}

	const courseId = id as Id<"courses">;

	const [preloadedDashboard, preloadedUnits] = await Promise.all([
		preloadQuery(
			api.courses.getDashboardSummary,
			{
				courseId,
				school: subdomain,
				userRole: undefined,
			},
			{ token: token },
		),
		preloadQuery(
			api.units.getTableData,
			{ courseId, school: subdomain },
			{ token: token },
		),
	]);

	return (
		<DashboardPageClient
			courseId={courseId}
			preloadedDashboard={preloadedDashboard}
			preloadedUnits={preloadedUnits}
		/>
	);
}
