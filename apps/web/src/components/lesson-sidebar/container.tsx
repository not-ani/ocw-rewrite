"use client";
import { UserButton } from "@clerk/nextjs";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { Suspense } from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { LessonSidebarContent } from "./content";

// Sidebar skeleton for smooth loading
function SidebarContentSkeleton() {
	return (
		<SidebarContent className="p-4">
			<div className="space-y-4">
				<Skeleton className="h-16 w-full rounded-lg" />
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={i} className="space-y-2">
						<Skeleton className="h-5 w-32" />
						<div className="space-y-1 pl-4">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
						</div>
					</div>
				))}
			</div>
		</SidebarContent>
	);
}

// Assuming SidebarProvider is wrapping the layout higher up
export const LessonSidebarContainer = ({
	courseId,
	subdomain,
}: {
	courseId: Id<"courses">;
	subdomain: string;
}) => {
	return (
		// Removed the outer div
		<Sidebar
			// Use library variants/props as needed
			className="border-sidebar border-none"
			collapsible="offcanvas"
			side="left"
			variant="floating" // Example: Use standard border or library's --sidebar-border
		>
			{/* Content is now rendered within Sidebar */}
			<Suspense fallback={<SidebarContentSkeleton />}>
				{/* Pass params down */}
				<LessonSidebarContent courseId={courseId} subdomain={subdomain} />
			</Suspense>
			<SidebarFooter>
				<Suspense fallback={<Skeleton className="h-8 w-8 rounded-full" />}>
					<UserButton />
				</Suspense>
			</SidebarFooter>
		</Sidebar>
	);
};
