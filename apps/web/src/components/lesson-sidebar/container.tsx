"use client"
import { UserButton } from "@clerk/nextjs";
import { Suspense } from "react";
import type { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Preloaded } from "convex/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { LessonSidebarContent } from "./content";

type PreloadedSidebar = Preloaded<typeof api.courses.getSidebarData>;

// Sidebar skeleton for smooth loading
function SidebarContentSkeleton() {
  return (
    <SidebarContent className="p-4">
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-lg" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-1 pl-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </SidebarContent>
  );
}

// Assuming SidebarProvider is wrapping the layout higher up
export const LessonSidebarContainer = ({ 
  preloadedSidebar 
}: { 
  preloadedSidebar: PreloadedSidebar 
}) => {
  return (
    // Removed the outer div
    <Sidebar
      // Use library variants/props as needed
      className="border-sidebar border-none"
      collapsible="offcanvas"
      side="left"
      variant="floating" // Example: Use standard border or library's --sidebar-border
    >
      {/* Content is now rendered within Sidebar */}
      <Suspense fallback={<SidebarContentSkeleton />}>
        {/* Pass params down */}
        <LessonSidebarContent preloadedSidebar={preloadedSidebar} />
      </Suspense>
      <SidebarFooter>
        <Suspense fallback={<Skeleton className="h-8 w-8 rounded-full" />}>
          <UserButton />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
};
