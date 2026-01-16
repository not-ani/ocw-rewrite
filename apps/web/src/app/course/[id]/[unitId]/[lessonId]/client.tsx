"use client";

import type { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import type { Preloaded } from "convex/react";
import { usePreloadedQuery } from "convex/react";
import { HomeIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { BreadcrumbCourse } from "@/components/lesson-sidebar/breadcrumb-course";
import { LessonSidebarContainer } from "@/components/lesson-sidebar/container";

const GoogleDocsEmbed = dynamic(
  () =>
    import("@/components/render/google-docs").then(
      (mod) => mod.GoogleDocsEmbed,
    ),
  {
    ssr: false,
  },
);

const GoogleDriveEmbed = dynamic(
  () =>
    import("@/components/render/google-drive").then(
      (mod) => mod.GoogleDriveEmbed,
    ),
  {
    ssr: false,
  },
);

const PdfViewer = dynamic(
  () => import("@/components/render/pdf-viewer").then((mod) => mod.PdfViewer),
  {
    ssr: false,
  },
);
const QuizletEmbed = dynamic(
  () => import("@/components/render/quizlet").then((mod) => mod.QuizletEmbed),
  {
    ssr: false,
  },
);
const YouTubeEmbed = dynamic(
  () => import("@/components/render/youtube").then((mod) => mod.YouTubeEmbed),
  {
    ssr: false,
  },
);

import dynamic from "next/dynamic";
import { Search } from "@/components/search";
import { buttonVariants } from "@ocw/ui/button";
import { Separator } from "@ocw/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@ocw/ui/sidebar";
import { Skeleton } from "@ocw/ui/skeleton";
import type { EmbedContent } from "@/lib/convex-utils";
import { cn } from "@/lib/utils";
import { OtherEmbed } from "@/components/render/other";

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
  pdfUrl,
}: {
  contentType: EmbedContent;
  embedId: string | null;
  password: string | null;
  pdfUrl: string | null;
}) {
  switch (contentType) {
    case "quizlet":
      return (
        <QuizletEmbed embedId={embedId ?? null} password={password ?? null} />
      );
    case "google_docs":
      return <GoogleDocsEmbed embedId={embedId ?? null} />;
    case "google_drive":
      return (
        <GoogleDriveEmbed
          embedId={embedId ?? null}
          password={password ?? null}
        />
      );
    case "youtube":
      return <YouTubeEmbed embedId={embedId ?? null} />;
    case "pdf":
      return <PdfViewer url={pdfUrl} />;
    default:
      return <OtherEmbed url={embedId ?? null} />;
  }
}

function Layout({
  children,
  courseId,
  subdomain,
}: {
  children: React.ReactNode;
  courseId: Id<"courses">;
  subdomain: string;
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
          <LessonSidebarContainer courseId={courseId} subdomain={subdomain} />
        </Suspense>
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <header className="flex h-16 shrink-0 items-center justify-between gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator className="mr-2 h-4" orientation="vertical" />
                <Suspense fallback={<BreadcrumbSkeleton />}>
                  <BreadcrumbCourse courseId={courseId} subdomain={subdomain} />
                </Suspense>
              </div>
              <div className="flex items-center gap-2 leading-none">
                <Search />
                <Separator orientation="vertical" className="w-1" />
                <Link
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "p-2 font-medium text-sm",
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

function LessonEmbedData({
  preloadedLesson,
}: {
  preloadedLesson: Preloaded<typeof api.lesson.getLessonById>;
}) {
  const lesson = usePreloadedQuery(preloadedLesson);

  return (
    <LessonEmbed
      contentType={lesson.lesson.contentType}
      embedId={lesson.embed.embedUrl}
      password={lesson.embed.password ?? null}
      pdfUrl={lesson.lesson.pdfUrl ?? null}
    />
  );
}

export function LessonPageClient({
  courseId,
  subdomain,
  preloadedLesson,
}: {
  courseId: Id<"courses">;
  subdomain: string;
  preloadedLesson: Preloaded<typeof api.lesson.getLessonById>;
}) {
  return (
    <Layout courseId={courseId} subdomain={subdomain}>
      <main className="h-min-screen w-full">
        <Suspense fallback={<LessonEmbedSkeleton />}>
          <LessonEmbedData preloadedLesson={preloadedLesson} />
        </Suspense>
      </main>
    </Layout>
  );
}
