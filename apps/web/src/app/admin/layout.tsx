import { LinkTabs, LinkTabsList, LinkTabsTab } from "@ocw/ui/link-tabs";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="mx-auto min-h-screen w-full max-w-[1800px] space-y-8 bg-background p-4 sm:p-6">
			<LinkTabs orientation="horizontal">
				<LinkTabsList>
					<LinkTabsTab href="/admin">Courses</LinkTabsTab>
					<LinkTabsTab href="/admin/site-content">Site Content</LinkTabsTab>
					<LinkTabsTab href="/admin/logs">Logs</LinkTabsTab>
				</LinkTabsList>
				<div className="flex-1">{children}</div>
			</LinkTabs>
		</div>
	);
}
