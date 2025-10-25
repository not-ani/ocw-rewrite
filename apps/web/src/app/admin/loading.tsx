/** biome-ignore-all lint/suspicious/noArrayIndexKey: perf doesn't matter skeleton */
import { Skeleton } from "@/components/ui/skeleton";

function HeaderSkeleton() {
	return (
		<div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
			<div className="space-y-2">
				<Skeleton className="h-9 w-64" />
				<Skeleton className="h-5 w-96" />
			</div>
		</div>
	);
}

function CoursesTableSkeleton() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-7 w-48" />
			<div className="rounded-lg border">
				<div className="border-b p-4">
					<div className="flex items-center justify-between">
						<Skeleton className="h-5 w-32" />
						<Skeleton className="h-5 w-24" />
					</div>
				</div>
				{[...Array(5)].map((_, i) => (
					<div key={i} className="border-b p-4 last:border-0">
						<div className="flex items-center justify-between">
							<div className="space-y-2">
								<Skeleton className="h-5 w-64" />
								<Skeleton className="h-4 w-96" />
							</div>
							<div className="flex items-center gap-3">
								<Skeleton className="h-6 w-20" />
								<Skeleton className="h-8 w-8" />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function AdminsTableSkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-7 w-48" />
				<Skeleton className="h-10 w-32" />
			</div>
			<div className="rounded-lg border">
				<div className="border-b p-4">
					<Skeleton className="h-5 w-32" />
				</div>
				{[...Array(3)].map((_, i) => (
					<div key={i} className="border-b p-4 last:border-0">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Skeleton className="h-10 w-10 rounded-full" />
								<div className="space-y-2">
									<Skeleton className="h-5 w-32" />
									<Skeleton className="h-4 w-48" />
								</div>
							</div>
							<Skeleton className="h-8 w-8" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default function AdminLoadingPage() {
	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6">
				<HeaderSkeleton />
				<CoursesTableSkeleton />
				<AdminsTableSkeleton />
			</div>
		</div>
	);
}
