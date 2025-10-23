import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { preloadQuery } from "convex/nextjs";
import { DashboardPageClient } from "./client";
import { getAuthToken } from "@/lib/auth";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { isValidConvexId } from "@/lib/convex-utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const subdomain = await extractSubdomain();
  
  if (!subdomain || !isValidConvexId(id)) {
    return {
      title: "Course Dashboard | OpenCourseWare",
      description: "Manage course content, units, and lessons",
      robots: "noindex, nofollow",
    };
  }

  try {
    const preloadedCourse = await preloadQuery(
      api.courses.getCourseWithUnitsAndLessons,
      {
        id: id as Id<"courses">,
        school: subdomain,
      },
    );

    const courseName = preloadedCourse._valueJSON
      ? JSON.parse(preloadedCourse._valueJSON)?.course?.name
      : "Course";

    return {
      title: `${courseName || "Course"} Dashboard | OpenCourseWare`,
      description: `Manage ${courseName || "course"} content, units, and lessons`,
      robots: "noindex, nofollow",
    };
  } catch {
    return {
      title: "Course Dashboard | OpenCourseWare",
      description: "Manage course content, units, and lessons",
      robots: "noindex, nofollow",
    };
  }
}

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
