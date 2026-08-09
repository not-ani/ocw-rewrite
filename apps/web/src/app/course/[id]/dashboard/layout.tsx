import { auth } from "@clerk/nextjs/server";

import { AppSidebar } from "@/components/dashboard/sidebar/app-sidebar";
import { CourseDashboardHeader } from "@/components/dashboard/sidebar/course-dashboard-header";
import { SidebarInset, SidebarProvider } from "@ocw/ui/sidebar";

// Authentication intentionally gates this private tree before course data renders.
export const instant = false;

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await auth.protect();

	return (
		<div className="w-full [--header-height:calc(--spacing(14))]">
			<SidebarProvider className="flex flex-col">
				<CourseDashboardHeader />
				<div className="flex flex-1">
					<AppSidebar />
					<SidebarInset>{children}</SidebarInset>
				</div>
			</SidebarProvider>
		</div>
	);
}
