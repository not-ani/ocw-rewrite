import { LinkTabs, LinkTabsList, LinkTabsTab } from "@/components/ui/link-tabs";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background mx-auto w-full max-w-[1800px] space-y-8 p-4 sm:p-6">
      <LinkTabs orientation="horizontal">
        <LinkTabsList className="">
          <LinkTabsTab href="/admin">Courses</LinkTabsTab>
          <LinkTabsTab href="/admin/site-content">Site Content</LinkTabsTab>
        </LinkTabsList>
        <div className="flex-1">{children}</div>
      </LinkTabs>
    </div>
  );
}
