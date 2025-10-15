import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { preloadQuery } from "convex/nextjs";
import { DashboardPageClient } from "./client";
import { getAuthToken } from "@/lib/auth";
import { extractSubdomain } from "@/lib/multi-tenant/server";

export default async function Dashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const courseId = id as Id<"courses">;

  const token = await getAuthToken();
  const subdomain = await extractSubdomain();
  if (!subdomain) {
    return null;
  }

  const [preloadedDashboard, preloadedUnits] = await Promise.all([
    preloadQuery(api.courses.getDashboardSummary, {
      courseId,
      school: subdomain,
      userRole: undefined, 
    }, {token: token}),
    preloadQuery(api.units.getTableData, { courseId, school: subdomain }, {token: token}),
  ]);

  return (
    <DashboardPageClient
      courseId={courseId}
      preloadedDashboard={preloadedDashboard}
      preloadedUnits={preloadedUnits}
    />
  );
}