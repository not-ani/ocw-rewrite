import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { preloadQuery } from "convex/nextjs";
import { LessonPageClient } from "./client";
import type { Metadata } from "next";
import { getAuthToken } from "@/lib/auth";


export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  const courseId = id as Id<"courses">;

  const token = await getAuthToken();
  const preloadedLesson = await preloadQuery(api.lesson.getLessonById, {
    id: lessonId as Id<"lessons">,

  }, {token: token});

  return (
    <LessonPageClient
      courseId={courseId}
      lessonId={lessonId as Id<"lessons">}
      preloadedLesson={preloadedLesson}
    />
  );
}
