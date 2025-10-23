"use client";

import type { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { usePreloadedQuery, type Preloaded } from "convex/react";
import { BreadcrumbCourse } from "@/components/lesson-sidebar/breadcrumb-course";
import { LessonSidebarContainer } from "@/components/lesson-sidebar/container";
import { GoogleDocsEmbed } from "@/components/render/google-docs";
import { QuizletEmbed } from "@/components/render/quizlet";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { HomeIcon } from "lucide-react";
import { Search } from "@/components/search";
import { Suspense } from "react";
import type { FunctionReturnType } from "convex/server";

type PreloadedLesson = Preloaded<typeof api.lesson.getLessonById>;
type LessonReturnType = FunctionReturnType<typeof api.lesson.getLessonById>;
type PreloadedSidebar = Preloaded<typeof api.courses.getSidebarData>;

function LessonEmbedSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      <Skeleton className="h-[87vh] w-full rounded-xl" />

      <div className="flex flex-row items-center justify-between p-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}

function BreadcrumbSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-16" />
      <span className="text-muted-foreground">/</span>
      <Skeleton className="h-4 w-24" />
      <span className="text-muted-foreground">/</span>
      <Skeleton className="h-4 w-20" />
      <span className="text-muted-foreground">/</span>
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

export function LessonPageSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      <SidebarProvider
        style={{
          //@ts-expect-error should work according to docs
          "--sidebar-width": "21rem",
        }}
      >
        <div className="border-sidebar border-none">
          <Skeleton className="h-screen w-[21rem]" />
        </div>
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <header className="flex h-16 shrink-0 items-center justify-between gap-2">
              <div className="flex items-center gap-2 px-4">
                <Skeleton className="h-6 w-6" />
                <Separator className="mr-2 h-4" orientation="vertical" />
                <BreadcrumbSkeleton />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-md" />
                <Separator orientation="vertical" className="w-1" />
                <Skeleton className="h-10 w-24 rounded-md" />
              </div>
            </header>
            <LessonEmbedSkeleton />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

function LessonEmbed({
  contentType,
  embedId,
  password,
}: {
  contentType: LessonReturnType["lesson"]["contentType"];
  embedId: string | null;
  password: string | null;
}) {
  switch (contentType) {
    case "quizlet":
      return (
        <QuizletEmbed embedId={embedId ?? null} password={password ?? null} />
      );
    case "google_docs":
      return <GoogleDocsEmbed embedId={embedId ?? null} />;
    case "google_drive":
      return <GoogleDocsEmbed embedId={embedId ?? null} />;
    default:
      return (
        <div className="flex h-[60vh] items-center justify-center rounded-lg border">
          <p className="text-muted-foreground">Unsupported content type</p>
        </div>
      );
  }
}

function Layout({
  children,
  preloadedSidebar,
}: {
  children: React.ReactNode;
  preloadedSidebar: PreloadedSidebar;
}) {
  return (
    <div className="flex h-screen flex-col">
      <SidebarProvider
        style={{
          //@ts-expect-error should work according to docs
          "--sidebar-width": "21rem",
        }}
      >
        <Suspense fallback={<Skeleton className="h-screen w-[21rem]" />}>
          <LessonSidebarContainer preloadedSidebar={preloadedSidebar} />
        </Suspense>
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <header className="flex h-16 shrink-0 items-center justify-between gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator className="mr-2 h-4" orientation="vertical" />
                <Suspense fallback={<BreadcrumbSkeleton />}>
                  <BreadcrumbCourse preloadedSidebar={preloadedSidebar} />
                </Suspense>
              </div>
              <div className="flex items-center gap-2 leading-none">
                <Search />
                <Separator orientation="vertical" className="w-1" />
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
            </header>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export function LessonPageClient({
  preloadedLesson,
  preloadedSidebar,
}: {
  preloadedLesson: PreloadedLesson;
  preloadedSidebar: PreloadedSidebar;
}) {
  const lesson = usePreloadedQuery(preloadedLesson);

  if (!lesson) {
    return <LessonPageSkeleton />;
  }

  return (
    <Layout preloadedSidebar={preloadedSidebar}>
      <main className="h-min-screen w-full">
        <Suspense fallback={<LessonEmbedSkeleton />}>
          <LessonEmbed
            contentType={lesson.lesson.contentType}
            embedId={lesson.embed.embedUrl ?? null}
            password={lesson.embed.password ?? null}
          />
        </Suspense>
      </main>
    </Layout>
  );
}
