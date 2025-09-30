"use client";
import type { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { usePreloadedQuery, type Preloaded } from "convex/react";
import {
  SidebarContent,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { UnitLessonNavigation } from "./client";
import { CourseHeader } from "./header";
import { useParams } from "next/navigation";

type PreloadedSidebar = Preloaded<typeof api.courses.getSidebarData>;

export const LessonSidebarContent = ({ 
  preloadedSidebar 
}: { 
  preloadedSidebar: PreloadedSidebar 
}) => {
  const resolvedParams = useParams<{ id: string; unitId: string; lessonId: string }>();
  const { id: courseId, unitId, lessonId } = resolvedParams;

  const data = usePreloadedQuery(preloadedSidebar);

  if (!data || data.length === 0) {
    return (
      <>
        <SidebarHeader className="p-4">Course Info</SidebarHeader>
        <SidebarSeparator />
        <SidebarContent className="p-4">No units found.</SidebarContent>
      </>
    );
  }

  return (
    <>
      <CourseHeader data={data} />
      <SidebarSeparator />
      <SidebarContent>
        <UnitLessonNavigation
          courseId={courseId}
          data={data}
          initialLessonId={lessonId}
          initialUnitId={unitId}
        />
      </SidebarContent>
    </>
  );
};
