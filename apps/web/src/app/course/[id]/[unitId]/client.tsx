"use client";
import type { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { usePreloadedQuery, type Preloaded } from "convex/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import Link from "next/link";
import { useSite } from "@/lib/multi-tenant/context";

type UnitWithLessons = Preloaded<typeof api.units.getUnitWithLessons>;

export function UnitPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="bg-background hidden w-full border-b p-4 md:block md:w-96 md:border-r md:border-b-0 md:p-6">
        <div className="mb-6">
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="space-y-2" key={i}>
              <Skeleton className="h-4 w-24 sm:w-32" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 p-4 pt-6 md:p-6 md:pt-8">
        <Skeleton className="mb-6 h-10 w-3/4 sm:w-2/3 md:w-3/4" />

        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <div className="mb-4 flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4 sm:w-2/3 md:w-3/4" />
                <Skeleton className="h-4 w-1/4 sm:w-1/6" />
              </div>
            </div>

            <div className="space-y-3 pl-0 sm:pl-8">
              {Array.from({ length: 5 }).map((_, subIndex) => (
                <Skeleton className="h-4 w-full" key={subIndex} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function UnitPageClient({
  preloadedUnit,
}: {
  preloadedUnit: UnitWithLessons;
}) {
  const unit = usePreloadedQuery(preloadedUnit);
  const school = useSite().subdomain;
  if (!unit) {
    return <UnitPageSkeleton />;
  }

  return (
    <div>
      <Header />
      <div className="flex h-screen flex-1 border-t-1">
        {/* Sidebar */}
        <div className="bg-background hidden border-r p-6 lg:block lg:w-96">
          <div className="bg-primary/10 mb-6 rounded-lg p-4">
            <Link
              href={`/course/${unit.course._id}`}
              className="text-primary/80 text-xl font-bold"
            >
              {unit.course.name}
            </Link>
            <p className="text-primary/60 mt-1 text-sm">{unit.name}</p>
          </div>
          <div className="ml-4 max-w-[calc(100%-2rem)] space-y-4">
            {unit.lessons.map((lesson, index) => (
              <div className="text-sm" key={lesson.id}>
                <div className="text-foreground mb-1">LESSON {index + 1}</div>
                <Link
                  className="text-foreground/80 break-words hover:underline"
                  href={`/course/${unit.course._id}/${unit._id}/${lesson.id}`}
                >
                  {lesson.name}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 pt-8">
          <h1 className="text-foreground mb-6 text-3xl font-bold">
            {unit.name}
          </h1>
          <div className="gap-10">
            <div className="py-1">
              <Accordion collapsible type="single" defaultValue="lessons">
                <AccordionItem className="rounded-lg border" value="lessons">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full text-white">
                        {unit.lessons.length}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Lessons</div>
                        <div className="text-sm text-gray-500">
                          {unit.lessons.length}{" "}
                          {unit.lessons.length === 1 ? "lesson" : "lessons"}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-16">
                    <div className="space-y-3 py-2">
                      {unit.lessons.map((lesson) => (
                        <Link
                          className="text-foreground block hover:underline"
                          key={lesson.id}
                          href={`/course/${unit.course._id}/${unit._id}/${lesson.id}`}
                        >
                          {lesson.name}
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
