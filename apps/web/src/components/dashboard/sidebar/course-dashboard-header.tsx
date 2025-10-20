"use client";
import { HomeIcon, SidebarIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import DashboardCommand from "@/components/dashboard/dashboard-command";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSite } from "@/lib/multi-tenant/context";

export function CourseDashboardHeader() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const { subdomain } = useSite();

  const routeParams = useMemo(() => {
    if (!subdomain) return null;
    
    const parts = pathname.split("/").filter(Boolean);

    if (parts[0] !== "course" || !parts[1]) {
      return null;
    }

    const courseId = parts[1] as Id<"courses">;
    let unitId: Id<"units"> | undefined;
    let lessonId: Id<"lessons"> | undefined;

    if (parts[3] === "unit" && parts[4]) {
      unitId = parts[4] as Id<"units">;
    }

    if (parts[3] === "lesson" && parts[4]) {
      lessonId = parts[4] as Id<"lessons">;
    }

    return { courseId, unitId, lessonId };
  }, [pathname, subdomain]);

  const breadcrumbData = useQuery(
    api.courses.getBreadcrumbData,
    routeParams && subdomain
      ? {
          courseId: routeParams.courseId,
          unitId: routeParams.unitId,
          lessonId: routeParams.lessonId,
          school: subdomain,
        }
      : "skip",
  );

  const pageType = useMemo(() => {
    if (!routeParams) return "unknown";
    if (routeParams.lessonId) return "lesson";
    if (routeParams.unitId) return "unit";
    return "dashboard";
  }, [routeParams]);

  const isLoading = routeParams && breadcrumbData === undefined;

  if (!subdomain) {
    return null;
  }

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          onClick={toggleSidebar}
          size="icon"
          variant="ghost"
        >
          <SidebarIcon />
        </Button>
        <Separator className="mr-2 h-4" orientation="vertical" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {isLoading ? (
              <BreadcrumbItem>
                <div className="bg-muted h-4 w-32 animate-pulse rounded" />
              </BreadcrumbItem>
            ) : breadcrumbData?.course ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={`/course/${breadcrumbData.course.id}/dashboard`}
                  >
                    {breadcrumbData.course.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>

                {breadcrumbData.unit && pageType !== "unit" && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        href={`/course/${breadcrumbData.course.id}/dashboard/unit/${breadcrumbData.unit.id}`}
                      >
                        {breadcrumbData.unit.name}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}

                {breadcrumbData.unit && pageType === "unit" && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {breadcrumbData.unit.name}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}

                {breadcrumbData.lesson && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {breadcrumbData.lesson.name}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}

                {pageType === "dashboard" && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </>
            ) : null}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex flex-row gap-3">
          <DashboardCommand />
          <Separator orientation="vertical" />
          <Link
            className={cn(
              buttonVariants({ variant: "outline" }),
              "p-2 text-sm font-medium",
            )}
            href={"/"}
          >
            <HomeIcon />
            Home
          </Link>
        </div>
      </div>
    </header>
  );
}
