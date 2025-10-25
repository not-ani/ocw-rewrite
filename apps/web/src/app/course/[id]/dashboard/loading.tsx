import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
	return (
		<div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
			<div className="space-y-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="space-y-2">
						<Skeleton className="h-8 w-64" />
						<Skeleton className="h-4 w-32" />
					</div>
					<div className="flex items-center gap-3">
						<Skeleton className="h-10 w-28" />
						<Skeleton className="h-10 w-32" />
					</div>
				</div>

				<div className="rounded-lg border">
					<div className="border-b p-4">
						<div className="flex items-center justify-between">
							<Skeleton className="h-5 w-48" />
							<Skeleton className="h-5 w-16" />
						</div>
					</div>
					{[...Array(5)].map((_, i) => (
						<div key={i} className="border-b p-4 last:border-0">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Skeleton className="h-4 w-4" />
									<div className="space-y-2">
										<Skeleton className="h-5 w-48" />
										<Skeleton className="h-4 w-20" />
									</div>
								</div>
								<Skeleton className="h-8 w-8" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
