import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { preloadQuery } from "convex/nextjs";
import { LessonPageClient } from "./client";
import { getAuthToken } from "@/lib/auth";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { notFound } from "next/navigation";
import { isValidConvexId } from "@/lib/convex-utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}): Promise<Metadata> {
  const { lessonId } = await params;
  const subdomain = await extractSubdomain();
  
  if (!subdomain || !isValidConvexId(lessonId)) {
    return {
      title: "Edit Lesson | OpenCourseWare",
      description: "Edit lesson content and settings",
      robots: "noindex, nofollow",
    };
  }

  try {
    const preloadedLesson = await preloadQuery(
      api.lesson.getLessonMetadata,
      {
        id: lessonId as Id<"lessons">,
        school: subdomain,
      },
    );

    const lessonName = preloadedLesson?.name || "Lesson";

    return {
      title: `Edit ${lessonName} | OpenCourseWare`,
      description: `Edit ${lessonName} content and settings`,
      robots: "noindex, nofollow",
    };
  } catch {
    return {
      title: "Edit Lesson | OpenCourseWare",
      description: "Edit lesson content and settings",
      robots: "noindex, nofollow",
    };
  }
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  const subdomain = await extractSubdomain();

  if (!subdomain) {
    notFound();
  }

  if (!isValidConvexId(id) || !isValidConvexId(lessonId)) {
    notFound();
  }

  const courseId = id as Id<"courses">;

  const token = await getAuthToken();
  const preloadedLesson = await preloadQuery(
    api.lesson.getLessonById,
    {
      id: lessonId as Id<"lessons">,
      school: subdomain,
    },
    { token: token },
  );

  return (
    <LessonPageClient
      courseId={courseId}
      lessonId={lessonId as Id<"lessons">}
      preloadedLesson={preloadedLesson}
    />
  );
}
