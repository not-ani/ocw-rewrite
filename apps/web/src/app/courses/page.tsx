import type { SearchParams } from "nuqs/server"
import { preloadQuery } from "convex/nextjs";
import { loadCourseParams } from "./parser";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { COURSES_PER_PAGE } from "./constants";
import { CoursesPage } from "./client";

type PageProps = {
  searchParams: Promise<SearchParams>
}


export default async function Page({ searchParams }: PageProps) {
  const { page, search } = await loadCourseParams(searchParams)

  const preloadedCourses = await preloadQuery(api.courses.getPaginatedCourses, {
    page,
    search,
    limit: COURSES_PER_PAGE
  })

  return (
    <CoursesPage preloadedCourses={preloadedCourses} />
  );
}
