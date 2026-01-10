"use client";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { Frame, SettingsIcon, Users2Icon } from "lucide-react";
import { useParams } from "next/navigation";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
} from "@ocw/ui/sidebar";
import { NavProjects } from "./nav-projects";

function getUrls(path: string) {
	return [
		{
			name: "Dashboard",
			url: `/course/${path}/dashboard`,
			icon: Frame,
		},
		{
			name: "Users",
			url: `/course/${path}/dashboard/users`,
			icon: Users2Icon,
		},
		{
			name: "Settings",
			url: `/course/${path}/dashboard/settings`,
			icon: SettingsIcon,
		},
	];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const params = useParams();
	const path = params.id as Id<"courses">;
	const urls = getUrls(path);
	return (
		<Sidebar
			className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
			{...props}
		>
			<SidebarContent>
				<NavProjects projects={urls} />
			</SidebarContent>
			<SidebarFooter />
		</Sidebar>
	);
}
