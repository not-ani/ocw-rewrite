"use client"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  MapIcon,
  PieChart,
  Send,
  Settings2,
  SettingsIcon,
  SquareTerminal,
  Users2Icon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "#",
        },
        {
          title: "Users",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "#",
      icon: Frame,
    },
    {
      name: "Users",
      url: "#",
      icon: Users2Icon,
    },
    {
      name: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
  ],
};

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
  ]
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
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={urls} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
