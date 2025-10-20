import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { preloadQuery } from "convex/nextjs";
import { LessonPageClient } from "./client";
import type { Metadata } from "next";
import { getAuthToken } from "@/lib/auth";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { notFound } from "next/navigation";
import { isValidConvexId } from "@/lib/convex-utils";

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
