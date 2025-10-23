import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { preloadQuery, fetchQuery } from "convex/nextjs";
import { CoursePageClient } from "./client";
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
      title: "Course | OpenCourseWare",
      description: "View course content and lessons",
    };
  }

  try {
    const courseData = await fetchQuery(
      api.courses.getCourseMetadata,
      {
        id: id as Id<"courses">,
        school: subdomain,
      },
    );

    let courseName: string;
    if (courseData?.name) {
      courseName = courseData.name;
    } else {
      courseName = "Course";
    }

    return {
      title: `${courseName} | OpenCourseWare`,
      description: `View and study ${courseName} content and lessons`,
    };
  } catch {
    return {
      title: "Course | OpenCourseWare",
      description: "View course content and lessons",
    };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const subdomain = await extractSubdomain();
  if (!subdomain) {
    return null;
  }

  if (!isValidConvexId(id)) {
    return null;
  }

  const preloadedCourse = await preloadQuery(
    api.courses.getCourseWithUnitsAndLessons,
    {
      id: id as Id<"courses">,
      school: subdomain,
    },
  );

  return <CoursePageClient preloadedCourse={preloadedCourse} />;
}
