"use client"
import Link from "next/link"
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useCallback } from "react";
import { useQueryStates } from "nuqs";
import { Pagination } from "@/components/courses/pagination";
import { SearchBar } from "@/components/courses/search-bar";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import { COURSES_PER_PAGE, SEARCH_DEBOUNCE_MS } from "./constants";
import { coursesSearchParams } from "./parser";

export function CourseCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-card shadow-md">
      <div className="flex flex-col p-4 h-36">
        {/* Title */}
        <Skeleton className="mb-2 h-6 w-3/4" />

        {/* Description */}
        <Skeleton className="mb-3 h-4 w-full" />
        <Skeleton className="mb-3 h-4 w-5/6" />
        <Skeleton className="mb-3 h-4 w-2/3" />

        {/* Units footer */}
        <div className="mt-auto flex items-center justify-between">
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
          {Array.from({ length: COURSES_PER_PAGE }).map((_, index) => (
            <CourseCardSkeleton key={index} />
          ))}
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-20" />
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

export function CoursesPage() {
  const [queryState, setQueryState] = useQueryStates(coursesSearchParams);
  const { page: currentPage, search: searchInput } = queryState;
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

  const coursesData = useQuery(api.courses.getPaginatedCourses, {
    page: currentPage,
    search: debouncedSearch,
    limit: COURSES_PER_PAGE
  });

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
                <Link
                  key={course._id}
                  className="flex flex-col overflow-hidden rounded-lg bg-card shadow-md transition-shadow duration-200 hover:shadow-lg"
                  href={`/course/${course._id}`}
                >
                  <div className="flex flex-col p-4 h-36">
                    <h3 className="mb-2 line-clamp-2 font-semibold text-foreground text-lg">
                      {course.name}
                    </h3>
                    <p className="mb-3 line-clamp-3 text-muted-foreground text-sm">
                      {course.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        {course.unitLength ?? 0} units
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Fillers so layout is always consistent */}
              {Array.from({ length: COURSES_PER_PAGE - courses.length }).map(
                (_, index) => (
                  <div
                    key={`filler-${index}`}
                    className="h-36 rounded-lg opacity-0 pointer-events-none"
                  />
                )
              )}

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
