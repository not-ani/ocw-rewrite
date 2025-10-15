import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { preloadQuery } from "convex/nextjs";
import { CoursePageClient } from "./client";
import { extractSubdomain } from "@/lib/multi-tenant/server";

export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  const subdomain = await extractSubdomain();
  if (!subdomain) {
    return null;
  }

  const preloadedCourse = await preloadQuery(api.courses.getCourseWithUnitsAndLessons, {
    id: id as Id<"courses">,
    school: subdomain,
  })

  return (
    <CoursePageClient
      preloadedCourse={preloadedCourse}
    />
  )
}
