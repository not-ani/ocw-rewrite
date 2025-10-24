import { Skeleton } from "@/components/ui/skeleton";

export default function LessonPageLoading() {
	return (
		<div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
			<div className="mb-6">
				<Skeleton className="h-9 w-48" />
			</div>

			<div className="space-y-6 rounded-lg border p-6">
				<div className="flex items-center justify-between">
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-9 w-24" />
				</div>

				<div className="space-y-4">
					<div className="space-y-2">
						<Skeleton className="h-5 w-24" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-5 w-32" />
						<Skeleton className="h-10 w-48" />
						<Skeleton className="h-4 w-56" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-5 w-40" />
						<Skeleton className="h-20 w-full" />
						<Skeleton className="h-4 w-72" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-4 w-4" />
						<Skeleton className="h-5 w-48" />
					</div>
				</div>

				<div className="flex items-center gap-3">
					<Skeleton className="h-10 w-40" />
					<Skeleton className="h-10 w-32" />
				</div>
			</div>
		</div>
	);
}
