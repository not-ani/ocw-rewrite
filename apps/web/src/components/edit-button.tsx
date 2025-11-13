"use client";

import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { Edit } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { useSite } from "@/lib/multi-tenant/context";
import { cn } from "@/lib/utils";
import { PermissionWrapper } from "./permissions";

function getLink(id: string, unitId?: string, lessonId?: string) {
	if (lessonId) {
		return `/course/${id}/dashboard/lesson/${lessonId}`;
	}
	if (unitId) {
		return `/course/${id}/dashboard/unit/${unitId}`;
	}
	return `/course/${id}/dashboard`;
}

export function EditButton() {
	const params = useParams();
	const { id, unitId, lessonId } = params as {
		id: string;
		unitId?: string;
		lessonId?: string;
	};
	const { subdomain } = useSite();
	const link = getLink(id, unitId, lessonId);

	return (
		<div className="relative">
			<PermissionWrapper
				courseId={id as Id<"courses">}
				requiredRole="editor"
				school={subdomain}
			>
				<Link
					prefetch
					href={link as Route}
					className={cn(
						buttonVariants({ variant: "default", size: "icon" }),
						"fixed right-4 bottom-4 rounded-full shadow-lg transition-shadow duration-200 hover:shadow-xl",
					)}
				>
					<Edit className="h-4 w-4" />
					<span className="sr-only">Edit</span>
				</Link>
			</PermissionWrapper>
		</div>
	);
}
