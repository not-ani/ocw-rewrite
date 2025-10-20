"use client";
import { BookIcon } from "lucide-react";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { SidebarData } from "./types";

export const CourseHeader = ({ data }: { data: SidebarData }) => {
  const course = data[0]?.course;

  if (!course) {
    return (
      <SidebarHeader className="p-4">
        <span className="text-sidebar-foreground">Course Not Found</span>
      </SidebarHeader>
    );
  }

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-3 p-3">
            <div className="bg-sidebar-accent flex aspect-square size-12 items-center justify-center rounded-lg">
              <BookIcon className="size-6 text-white" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate text-xl font-semibold">
                {course.name}
              </span>
              <span className="text-sidebar-foreground truncate text-xs">
                {course.subjectId}
              </span>
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
};
