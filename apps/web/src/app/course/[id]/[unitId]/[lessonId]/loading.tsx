import { Separator } from "@ocw/ui/separator";
import { SidebarInset, SidebarProvider } from "@ocw/ui/sidebar";
import { Skeleton } from "@ocw/ui/skeleton";

function BreadcrumbSkeleton() {
	return (
		<div className="flex items-center gap-2">
			<Skeleton className="h-4 w-16" />
			<span className="text-muted-foreground">/</span>
			<Skeleton className="h-4 w-24" />
			<span className="text-muted-foreground">/</span>
			<Skeleton className="h-4 w-20" />
			<span className="text-muted-foreground">/</span>
			<Skeleton className="h-4 w-32" />
		</div>
	);
}

function SidebarSkeleton() {
	return (
		<div className="h-screen w-[21rem] border-r bg-background p-4">
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
		</div>
	);
}

function LessonEmbedSkeleton() {
	return (
		<div className="flex h-screen flex-col">
			<div className="flex flex-row items-center justify-between p-4">
				<Skeleton className="h-9 w-48" />
				<Skeleton className="h-10 w-36" />
			</div>
			<Skeleton className="h-[87vh] w-full rounded-xl" />
		</div>
	);
}

export default function LessonLoading() {
	return (
		<div className="flex h-screen flex-col">
			<SidebarProvider
				style={{
					//@ts-expect-error should work according to docs
					"--sidebar-width": "21rem",
				}}
			>
				<SidebarSkeleton />
				<SidebarInset>
					<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
						<header className="flex h-16 shrink-0 items-center justify-between gap-2">
							<div className="flex items-center gap-2 px-4">
								<Skeleton className="h-6 w-6" />
								<Separator className="mr-2 h-4" orientation="vertical" />
								<BreadcrumbSkeleton />
							</div>
							<div className="flex items-center gap-2">
								<Skeleton className="h-10 w-10 rounded-md" />
								<Separator orientation="vertical" className="w-1" />
								<Skeleton className="h-10 w-24 rounded-md" />
							</div>
						</header>
						<main className="h-min-screen w-full">
							<LessonEmbedSkeleton />
						</main>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
