import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { preloadQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { LessonPageClient } from "./client";

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string; unitId: string; lessonId: string }>
}): Promise<Metadata> {
  const { lessonId } = await params;
  
  try {
    const preloadedLesson = await preloadQuery(api.lesson.getLessonById, {
      id: lessonId as Id<"lessons">,
    });
    
    // Extract lesson name from preloaded data
    const lessonName = preloadedLesson._valueJSON 
      ? JSON.parse(preloadedLesson._valueJSON)?.lesson?.name 
      : "Lesson";
    
    return {
      title: lessonName || "Lesson",
      description: `View and study ${lessonName || "this lesson"}`,
    };
  } catch {
    return {
      title: "Lesson",
      description: "View and study this lesson",
    };
  }
}

export default async function Page({
  params
}: {
  params: Promise<{ id: string; unitId: string; lessonId: string }>
}) {
  const { id, lessonId } = await params;

  // Preload both lesson data and sidebar data in parallel for optimal performance
  // This ensures data is fetched on the server and streamed to the client
  const [preloadedLesson, preloadedSidebar] = await Promise.all([
    preloadQuery(api.lesson.getLessonById, {
      id: lessonId as Id<"lessons">,
    }),
    preloadQuery(api.courses.getSidebarData, {
      courseId: id as Id<"courses">,
    })
  ]);

  return (
    <LessonPageClient 
      preloadedLesson={preloadedLesson}
      preloadedSidebar={preloadedSidebar}
    />
  );
}