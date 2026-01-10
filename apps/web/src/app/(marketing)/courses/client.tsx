/** biome-ignore-all lint/suspicious/noArrayIndexKey: ts mpo icl */
"use client";
import { api } from "@ocw/backend/convex/_generated/api";
import type { Preloaded } from "convex/react";
import { usePreloadedQuery, useQuery } from "convex/react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { Suspense, useCallback, useMemo } from "react";
import { Pagination } from "@/components/courses/pagination";
import { SearchBar } from "@/components/courses/search-bar";
import { Skeleton } from "@ocw/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { COURSES_PER_PAGE, SEARCH_DEBOUNCE_MS } from "./constants";
import { coursesSearchParams } from "./parser";

export function CourseCardSkeleton() {
	return (
		<div className="flex flex-col overflow-hidden rounded-lg bg-card shadow-md">
			<div className="flex h-36 flex-col p-4">
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
	const skeletonKeys = useMemo(
		() => Array.from({ length: COURSES_PER_PAGE }, () => crypto.randomUUID()),
		[],
	);
	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="mb-8">
					<div className="max-w-md">
						<Skeleton className="h-10 w-full" />
					</div>
				</div>

				<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{skeletonKeys.map((i) => (
						<CourseCardSkeleton key={i} />
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

function CoursesData({
	subdomain,
	preloadedCourses,
}: {
	subdomain: string;
	preloadedCourses: Preloaded<typeof api.courses.getPaginatedCourses>;
}) {
	const [queryState, setQueryState] = useQueryStates(coursesSearchParams);
	const { page: currentPage, search: searchInput } = queryState;
	const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

	// Use preloaded query for initial render, then useQuery for reactivity when params change
	const preloadedData = usePreloadedQuery(preloadedCourses);
	const isInitialLoad =
		currentPage === 1 && !debouncedSearch && !searchInput;

	const dynamicData = useQuery(
		api.courses.getPaginatedCourses,
		isInitialLoad
			? "skip"
			: {
					page: currentPage,
					search: debouncedSearch,
					limit: COURSES_PER_PAGE,
					school: subdomain,
				},
	);

	// Use preloaded data for initial load, otherwise use dynamic data (fallback to preloaded if dynamic is loading)
	const coursesData = isInitialLoad
		? preloadedData
		: dynamicData ?? preloadedData;

	const courses = coursesData.courses ?? [];
	const totalPages = coursesData?.totalPages ?? 1;
	const totalCourses = coursesData?.totalCourses ?? 0;

	const goToPage = useCallback(
		(page: number) => {
			void setQueryState({ page });
			window.scrollTo({ top: 0, behavior: "smooth" });
		},
		[setQueryState],
	);

	const handleSearchChange = useCallback(
		(value: string) => {
			void setQueryState({ search: value, page: 1 });
		},
		[setQueryState],
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
									prefetch
									key={course._id}
									className="flex flex-col overflow-hidden rounded-lg bg-card shadow-md transition-shadow duration-200 hover:shadow-lg"
									href={`/course/${course._id}`}
								>
									<div className="flex h-36 flex-col p-4">
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

							{Array.from({ length: COURSES_PER_PAGE - courses.length }).map(
								(_, index) => (
									<div
										key={`filler-${index}`}
										className="pointer-events-none h-36 rounded-lg opacity-0"
									/>
								),
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

export function CoursesPage({
	subdomain,
	preloadedCourses,
}: {
	subdomain: string;
	preloadedCourses: Preloaded<typeof api.courses.getPaginatedCourses>;
}) {
	return (
		<Suspense fallback={<CoursesPageSkeleton />}>
			<CoursesData subdomain={subdomain} preloadedCourses={preloadedCourses} />
		</Suspense>
	);
}
