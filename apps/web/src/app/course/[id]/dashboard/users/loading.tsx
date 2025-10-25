import { Skeleton } from "@/components/ui/skeleton";

export default function UsersPageLoading() {
	return (
		<div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
			<div className="space-y-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="space-y-2">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-4 w-64" />
					</div>
					<Skeleton className="h-10 w-32" />
				</div>

				<div className="rounded-lg border">
					<div className="border-b bg-muted/50 p-4">
						<div className="grid grid-cols-12 gap-4">
							<Skeleton className="col-span-4 h-5 w-24" />
							<Skeleton className="col-span-3 h-5 w-20" />
							<Skeleton className="col-span-3 h-5 w-16" />
							<Skeleton className="col-span-2 h-5 w-20" />
						</div>
					</div>

					{[...Array(5)].map((_, i) => (
						<div key={i} className="border-b p-4 last:border-0">
							<div className="grid grid-cols-12 items-center gap-4">
								<div className="col-span-4 flex items-center gap-3">
									<Skeleton className="h-10 w-10 rounded-full" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-3 w-40" />
									</div>
								</div>

								<div className="col-span-3">
									<Skeleton className="h-6 w-16" />
								</div>

								<div className="col-span-3">
									<Skeleton className="h-6 w-20" />
								</div>

								<div className="col-span-2 flex justify-end">
									<Skeleton className="h-8 w-8" />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
