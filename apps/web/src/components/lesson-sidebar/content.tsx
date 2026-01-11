"use client";
import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import {
	SidebarContent,
	SidebarHeader,
	SidebarSeparator,
} from "@ocw/ui/sidebar";
import { UnitLessonNavigation } from "./client";
import { CourseHeader } from "./header";

export const LessonSidebarContent = ({
	courseId,
	subdomain,
}: {
	courseId: Id<"courses">;
	subdomain: string;
}) => {
	const resolvedParams = useParams<{
		id: string;
		unitId: string;
		lessonId: string;
	}>();
	const { unitId, lessonId } = resolvedParams;

	const data = useQuery(api.courses.getSidebarData, {
		courseId,
		school: subdomain,
	});

	if (!data || data.length === 0) {
		return (
			<>
				<SidebarHeader className="p-4">Course Info</SidebarHeader>
				<SidebarSeparator />
				<SidebarContent className="p-4">No units found.</SidebarContent>
			</>
		);
	}

	return (
		<>
			<CourseHeader data={data} />
			<SidebarSeparator />
			<SidebarContent>
				<UnitLessonNavigation
					courseId={courseId}
					data={data}
					initialLessonId={lessonId}
					initialUnitId={unitId}
				/>
			</SidebarContent>
		</>
	);
};
