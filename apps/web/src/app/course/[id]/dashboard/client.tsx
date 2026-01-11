"use client";

import { SignInButton } from "@clerk/nextjs";
import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useMutation,
	usePreloadedQuery,
} from "convex/react";
import type { Preloaded } from "convex/react";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { CreateUnitDialog } from "@/components/dashboard/units/create-unit";
import { ForkUnitDialog } from "@/components/dashboard/units/fork-unit-dialog";
import { UnitsTable } from "@/components/dashboard/units/units-table";
import { Button } from "@ocw/ui/button";
import { Skeleton } from "@ocw/ui/skeleton";

function DashboardHeaderSkeleton() {
	return (
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
	);
}

function UnitsTableSkeleton() {
	return (
		<div className="space-y-3">
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
	);
}

function DashboardHeader({
	courseId,
	courseName,
}: {
	courseId: Id<"courses">;
	courseName: string;
}) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-3">
			<div>
				<h1 className="font-bold text-2xl">{courseName}</h1>
				<p className="text-muted-foreground text-sm">Manage units</p>
			</div>
			<div className="flex items-center justify-evenly gap-3">
				<Link className="inline-flex" href={`/course/${courseId}`}>
					<Button type="button" variant="secondary">
						View course
					</Button>
				</Link>
				<ForkUnitDialog courseId={courseId} />
				<CreateUnitDialog />
			</div>
		</div>
	);
}

function DashboardHeaderData({
	courseId,
	preloadedDashboard,
}: {
	courseId: Id<"courses">;
	preloadedDashboard: Preloaded<typeof api.courses.getDashboardSummary>;
}) {
	const dashboard = usePreloadedQuery(preloadedDashboard);

	if (!dashboard) {
		return <DashboardHeaderSkeleton />;
	}

	return <DashboardHeader courseId={courseId} courseName={dashboard.course.name} />;
}

function UnitsTableData({
	courseId,
	subdomain,
	preloadedUnits,
}: {
	courseId: Id<"courses">;
	subdomain: string;
	preloadedUnits: Preloaded<typeof api.units.getTableData>;
}) {
	const units = usePreloadedQuery(preloadedUnits);

	const updateUnit = useMutation(api.units.update);
	const reorderUnits = useMutation(api.units.reorder);
	const removeUnit = useMutation(api.units.remove);

	const [selectedUnitId, setSelectedUnitId] = useState<null | Id<"units">>(
		null,
	);

	const unitList = useMemo(() => units ?? [], [units]);

	useEffect(() => {
		if (!selectedUnitId && unitList[0]) {
			setSelectedUnitId(unitList[0].id as Id<"units">);
		}
	}, [selectedUnitId, unitList]);

	const handleUpdateUnit = useCallback(
		async (payload: {
			id: Id<"units">;
			data: Partial<{ isPublished: boolean }>;
		}) => {
			updateUnit({
				courseId,
				school: subdomain,
				data: { id: payload.id, ...payload.data },
			});
		},
		[updateUnit, courseId, subdomain],
	);

	const handleRemoveUnit = useCallback(
		(id: Id<"units">) => {
			removeUnit({ courseId, id, school: subdomain });
			setSelectedUnitId((prev) => (prev === id ? null : prev));
		},
		[removeUnit, courseId, subdomain],
	);

	const handleReorderUnits = useCallback(
		(data: { id: Id<"units">; position: number }[]) => {
			reorderUnits({ courseId, data, school: subdomain });
		},
		[reorderUnits, courseId, subdomain],
	);

	if (!units) {
		return <UnitsTableSkeleton />;
	}

	return (
		<UnitsTable
			courseId={courseId}
			onRemoveUnit={handleRemoveUnit}
			onReorder={handleReorderUnits}
			onUpdateUnit={handleUpdateUnit}
			units={unitList}
		/>
	);
}

function DashboardContent({
	courseId,
	subdomain,
	preloadedDashboard,
	preloadedUnits,
}: {
	courseId: Id<"courses">;
	subdomain: string;
	preloadedDashboard: Preloaded<typeof api.courses.getDashboardSummary>;
	preloadedUnits: Preloaded<typeof api.units.getTableData>;
}) {
	return (
		<div className="space-y-6">
			<Suspense fallback={<DashboardHeaderSkeleton />}>
				<DashboardHeaderData
					courseId={courseId}
					preloadedDashboard={preloadedDashboard}
				/>
			</Suspense>

			<Suspense fallback={<UnitsTableSkeleton />}>
				<UnitsTableData
					courseId={courseId}
					subdomain={subdomain}
					preloadedUnits={preloadedUnits}
				/>
			</Suspense>
		</div>
	);
}

export function DashboardPageClient({
	courseId,
	subdomain,
	preloadedDashboard,
	preloadedUnits,
}: {
	courseId: Id<"courses">;
	subdomain: string;
	preloadedDashboard: Preloaded<typeof api.courses.getDashboardSummary>;
	preloadedUnits: Preloaded<typeof api.units.getTableData>;
}) {
	return (
		<div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
			<Authenticated>
				<DashboardContent
					courseId={courseId}
					subdomain={subdomain}
					preloadedDashboard={preloadedDashboard}
					preloadedUnits={preloadedUnits}
				/>
			</Authenticated>

			<Unauthenticated>
				<div className="mx-auto max-w-xl text-center">
					<h1 className="mb-2 font-semibold text-2xl">Sign in required</h1>
					<p className="text-muted-foreground">Sign in to access dashboards.</p>
					<div className="mt-4 inline-flex">
						<SignInButton />
					</div>
				</div>
			</Unauthenticated>

			<AuthLoading>
				<div className="space-y-6">
					<DashboardHeaderSkeleton />
					<UnitsTableSkeleton />
				</div>
			</AuthLoading>
		</div>
	);
}
