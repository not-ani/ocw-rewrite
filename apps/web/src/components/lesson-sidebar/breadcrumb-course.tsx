"use client";
import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { cache, useMemo } from "react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import type { SidebarData } from "./types";

const getCurrentLesson = cache((data: SidebarData, lessonId: string) => {
	return data.flatMap((unit) =>
		unit.lessons.filter((lesson) => lesson.id === lessonId),
	)[0]?.name;
});

export const BreadcrumbCourse = ({
	courseId,
	subdomain,
}: {
	courseId: Id<"courses">;
	subdomain: string;
}) => {
	const { lessonId } = useParams<{ id: string; lessonId: string }>();

	const data = useQuery(api.courses.getSidebarData, {
		courseId,
		school: subdomain,
	});

	const currentLesson = useMemo(
		() => (data && data.length > 0 ? getCurrentLesson(data, lessonId) : null),
		[data, lessonId],
	);

	if (!data || data.length === 0) {
		return (
			<div className="flex items-center gap-2">
				<Skeleton className="h-4 w-16" />
				<span className="text-muted-foreground">/</span>
				<Skeleton className="h-4 w-24" />
			</div>
		);
	}

	return (
		<div>
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem className="hidden md:flex">
						<BreadcrumbLink className="hidden md:flex" href="/courses">
							Courses
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator className="hidden md:flex" />
					<BreadcrumbItem className="hidden md:flex">
						<BreadcrumbLink
							className="hidden md:flex"
							href={`/course/${data[0]?.courseId}`}
						>
							{data[0]?.course.name ?? "Unknown Course"}
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator className="hidden md:flex" />
					<BreadcrumbItem className="hidden md:flex">
						<BreadcrumbLink
							href={`/course/${data[0]?.courseId}/${data[0]?.id}`}
						>
							{data[0]?.name ?? "Unknown Unit"}
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator className="hidden md:flex" />
					<BreadcrumbItem>
						<BreadcrumbPage>{currentLesson ?? "Unknown Lesson"}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
		</div>
	);
};
