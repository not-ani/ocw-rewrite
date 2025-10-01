import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { preloadQuery } from "convex/nextjs";
import { DashboardPageClient } from "./client";
import { getAuthToken } from "@/lib/auth";

export default async function Dashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const courseId = id as Id<"courses">;

  const token = await getAuthToken();

  const [preloadedDashboard, preloadedUnits] = await Promise.all([
    preloadQuery(api.courses.getDashboardSummary, {
      courseId,
      userRole: undefined, 
    }, {token: token}),
    preloadQuery(api.units.getTableData, { courseId }, {token: token}),
  ]);

  return (
    <DashboardPageClient
      courseId={courseId}
      preloadedDashboard={preloadedDashboard}
      preloadedUnits={preloadedUnits}
    />
  );
}