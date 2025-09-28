"use client"
import type { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { type Preloaded, usePreloadedQuery } from "convex/react";
import { useCallback } from "react";
import { useQueryStates } from "nuqs";
import { CourseCard } from "@/components/courses/course-card";
import { Pagination } from "@/components/courses/pagination";
import { SearchBar } from "@/components/courses/search-bar";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import { SEARCH_DEBOUNCE_MS } from "./constants";
import { coursesSearchParams } from "./parser";

function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-card shadow-md">
      <Skeleton className="h-48 w-full" />
      <div className="p-4">
        <Skeleton className="mb-2 h-6 w-3/4" />
        <Skeleton className="mb-3 h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-3 flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

function CoursesPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="max-w-md">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <CourseCardSkeleton key={index} />
          ))}
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-8" />
            <Skeleton className="h-10 w-8" />
            <Skeleton className="h-10 w-8" />
            <Skeleton className="h-10 w-20" />
          </div>
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </div>
  );
}

export function CoursesPage({
  preloadedCourses
}: {
  preloadedCourses: Preloaded<typeof api.courses.getPaginatedCourses>
}) {
  const [queryState, setQueryState] = useQueryStates(coursesSearchParams);
  const { page: currentPage, search: searchInput } = queryState;
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

  const coursesData = usePreloadedQuery(preloadedCourses);

  const courses = coursesData?.courses ?? [];
  const totalPages = coursesData?.totalPages ?? 1;
  const totalCourses = coursesData?.totalCourses ?? 0;

  const goToPage = useCallback(
    (page: number) => {
      void setQueryState({ page });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setQueryState]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      void setQueryState({ search: value, page: 1 });
    },
    [setQueryState]
  );

  if (!coursesData) {
    return <CoursesPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <SearchBar
            onChange={handleSearchChange}
            onSubmit={() => {
              void setQueryState({ page: 1 });
            }}
            value={searchInput}
          />
        </div>

        {courses.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">
              {debouncedSearch
                ? `No courses found for "${debouncedSearch}"`
                : "No courses available"}
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courses.map((course) => (
                <p key={course._id}>
                  {course.name}
                </p>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col items-center space-y-4">
                <Pagination
                  currentPage={currentPage}
                  onPageChange={goToPage}
                  totalPages={totalPages}
                />
                <p className="text-muted-foreground text-sm">
                  Showing page {currentPage} of {totalPages} ({totalCourses}{" "}
                  total courses)
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
