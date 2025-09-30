import { AppSidebar } from "@/components/dashboard/sidebar/app-sidebar";
import { CourseDashboardHeader } from "@/components/dashboard/sidebar/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full [--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <CourseDashboardHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
