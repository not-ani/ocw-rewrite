import { Skeleton } from "@ocw/ui/skeleton";

export default function UnitPageLoading() {
	return (
		<div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
			<div className="mb-6">
				<Skeleton className="h-9 w-48" />
			</div>

			<div className="space-y-8">
				<div className="space-y-6 rounded-lg border p-6">
					<Skeleton className="h-6 w-32" />

					<div className="space-y-4">
						<div className="space-y-2">
							<Skeleton className="h-5 w-24" />
							<Skeleton className="h-10 w-full" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-5 w-32" />
							<Skeleton className="h-24 w-full" />
							<Skeleton className="h-4 w-48" />
						</div>
						<div className="flex items-center gap-2">
							<Skeleton className="h-4 w-4" />
							<Skeleton className="h-5 w-48" />
						</div>
					</div>

					<Skeleton className="h-10 w-32" />
				</div>

				<div className="border-t pt-8">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<Skeleton className="h-6 w-24" />
							<Skeleton className="h-10 w-32" />
						</div>

						<div className="rounded-lg border">
							<div className="border-b p-4">
								<div className="flex items-center justify-between">
									<Skeleton className="h-5 w-48" />
									<Skeleton className="h-5 w-16" />
								</div>
							</div>
							{[...Array(3)].map((_, i) => (
								<div key={i} className="border-b p-4 last:border-0">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<Skeleton className="h-4 w-4" />
											<div className="space-y-2">
												<Skeleton className="h-5 w-64" />
												<div className="flex items-center gap-2">
													<Skeleton className="h-4 w-20" />
													<Skeleton className="h-4 w-24" />
												</div>
											</div>
										</div>
										<Skeleton className="h-8 w-8" />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
