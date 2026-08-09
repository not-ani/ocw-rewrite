"use client";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { Suspense } from "react";

import { Pagination } from "@/components/courses/pagination";
import { SearchBar } from "@/components/courses/search-bar";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { api } from "@ocw/backend/convex/_generated/api";
import { Skeleton } from "@ocw/ui/skeleton";

import { COURSES_PER_PAGE, SEARCH_DEBOUNCE_MS } from "./constants";
import { coursesSearchParams } from "./parser";

const courseSkeletonKeys = Array.from(
	{ length: COURSES_PER_PAGE },
	(_, index) => `course-skeleton-${index + 1}`,
);

export function CourseCardSkeleton() {
	return (
		<div className="bg-card flex min-h-[10rem] flex-col overflow-hidden rounded-lg shadow-md">
			<div className="flex flex-1 flex-col p-5">
				{/* Title */}
				<Skeleton className="mb-3 h-6 w-3/4" />

				{/* Description */}
				<div className="mb-4 space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6" />
					<Skeleton className="h-4 w-2/3" />
				</div>

				{/* Units footer */}
				<div className="border-border/50 mt-auto flex items-center border-t pt-3">
					<Skeleton className="h-4 w-20" />
				</div>
			</div>
		</div>
	);
}

export function CoursesPageSkeleton() {
	return (
		<div className="bg-background min-h-screen">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="mb-8">
					<div className="max-w-md">
						<Skeleton className="h-10 w-full" />
					</div>
				</div>

				<div className="mb-8 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{courseSkeletonKeys.map((key) => (
						<CourseCardSkeleton key={key} />
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
	initialCourses,
}: {
	subdomain: string;
	initialCourses: FunctionReturnType<typeof api.courses.getPaginatedCourses>;
}) {
	const [queryState, setQueryState] = useQueryStates(coursesSearchParams);
	const { page: currentPage, search: searchInput } = queryState;
	const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

	const isInitialLoad = currentPage === 1 && !debouncedSearch && !searchInput;

	const dynamicData = useQuery(api.courses.getPaginatedCourses, {
		page: currentPage,
		search: debouncedSearch,
		limit: COURSES_PER_PAGE,
		school: subdomain,
	});

	const coursesData =
		dynamicData ?? (isInitialLoad ? initialCourses : undefined);

	const goToPage = (page: number) => {
		void setQueryState({ page });
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleSearchChange = (value: string) => {
		void setQueryState({ search: value, page: 1 });
	};

	if (!coursesData) {
		return <CoursesPageSkeleton />;
	}

	const courses = coursesData.courses ?? [];
	const totalPages = coursesData.totalPages ?? 1;
	const totalCourses = coursesData.totalCourses ?? 0;
	const fillerKeys = Array.from(
		{ length: COURSES_PER_PAGE - courses.length },
		(_, index) => `course-filler-${courses.length + index + 1}`,
	);

	return (
		<div className="bg-background min-h-screen">
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
						<p className="text-muted-foreground text-lg">
							{debouncedSearch
								? `No courses found for "${debouncedSearch}"`
								: "No courses available"}
						</p>
					</div>
				) : (
					<div>
						<div className="mb-8 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{courses.map((course) => (
								<Link
									prefetch
									key={course._id}
									className="group bg-card flex min-h-[10rem] flex-col overflow-hidden rounded-lg shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
									href={`/course/${course._id}`}
								>
									<div className="flex flex-1 flex-col p-5">
										<h3 className="text-foreground group-hover:text-primary mb-3 text-lg leading-snug font-semibold transition-colors">
											{course.name}
										</h3>
										<p className="text-muted-foreground mb-4 text-sm leading-relaxed">
											{course.description}
										</p>
										<div className="border-border/50 mt-auto flex items-center border-t pt-3">
											<span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
												{course.unitLength ?? 0} units
											</span>
										</div>
									</div>
								</Link>
							))}

							{fillerKeys.map((key) => (
								<div
									key={key}
									className="pointer-events-none min-h-[10rem] rounded-lg opacity-0"
								/>
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

export function CoursesPage({
	subdomain,
	initialCourses,
}: {
	subdomain: string;
	initialCourses: FunctionReturnType<typeof api.courses.getPaginatedCourses>;
}) {
	return (
		<Suspense fallback={<CoursesPageSkeleton />}>
			<CoursesData initialCourses={initialCourses} subdomain={subdomain} />
		</Suspense>
	);
}
