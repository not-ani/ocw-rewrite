import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { preloadQuery } from "convex/nextjs";
import { CoursePageClient } from "./client";

export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  const preloadedCourse = await preloadQuery(api.courses.getCourseWithUnitsAndLessons, {
    id: id as Id<"courses">
  })

  return (
    <CoursePageClient
      preloadedCourse={preloadedCourse}
    />
  )
}
