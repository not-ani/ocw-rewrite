"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useMutation,
	useQuery,
} from "convex/react";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { CreateUnitDialog } from "@/components/dashboard/units/create-unit";
import { UnitsTable } from "@/components/dashboard/units/units-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

function DashboardContent({
	courseId,
	subdomain,
}: {
	courseId: Id<"courses">;
	subdomain: string;
}) {
	const user = useUser();
	const roleFromClerk = user.user?.publicMetadata?.role;
	const userRole =
		typeof roleFromClerk === "string" ? roleFromClerk : undefined;

	const membership = useQuery(api.courseUsers.getMyMembership, {
		courseId,
		school: subdomain,
	});

	const dashboard = useQuery(api.courses.getDashboardSummary, {
		courseId,
		school: subdomain,
		userRole: undefined,
	});
	const units = useQuery(api.units.getTableData, {
		courseId,
		school: subdomain,
	});

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
			await updateUnit({
				courseId,
				school: subdomain,
				data: { id: payload.id, ...payload.data },
			});
		},
		[updateUnit, courseId, subdomain],
	);

	const handleRemoveUnit = useCallback(
		async (id: Id<"units">) => {
			await removeUnit({ courseId, id, school: subdomain });
			setSelectedUnitId((prev) => (prev === id ? null : prev));
		},
		[removeUnit, courseId, subdomain],
	);

	const handleReorderUnits = useCallback(
		async (data: { id: Id<"units">; position: number }[]) => {
			await reorderUnits({ courseId, data, school: subdomain });
		},
		[reorderUnits, courseId, subdomain],
	);

	if (!user.isLoaded) {
		return null;
	}

	const isLoadingMembership = membership === undefined;

	const isAuthorized =
		membership?.role === "admin" ||
		membership?.role === "editor" ||
		userRole === "admin";

	if (isLoadingMembership) {
		return (
			<div className="space-y-6">
				<DashboardHeaderSkeleton />
				<UnitsTableSkeleton />
			</div>
		);
	}

	if (!isAuthorized) {
		return (
			<div className="mx-auto max-w-xl text-center">
				<h1 className="mb-2 font-semibold text-2xl">Access denied</h1>
				<p className="text-muted-foreground">
					You do not have permission to view this course dashboard.
				</p>
				<div className="mt-4">
					<Link href={`/course/${courseId}`} className="text-primary underline">
						Back to course
					</Link>
				</div>
			</div>
		);
	}

	if (!dashboard || dashboard === undefined) {
		return (
			<div className="mx-auto max-w-xl text-center">
				<h1 className="mb-2 font-semibold text-2xl">No data</h1>
				<p className="text-muted-foreground">Dashboard could not be loaded.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Suspense fallback={<DashboardHeaderSkeleton />}>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="font-bold text-2xl">{dashboard.course.name}</h1>
						<p className="text-muted-foreground text-sm">Manage units</p>
					</div>
					<div className="flex items-center justify-evenly gap-3">
						<Link className="inline-flex" href={`/course/${courseId}`}>
							<Button type="button" variant="secondary">
								View course
							</Button>
						</Link>
						<CreateUnitDialog />
					</div>
				</div>
			</Suspense>

			<Suspense fallback={<UnitsTableSkeleton />}>
				<UnitsTable
					courseId={courseId}
					onRemoveUnit={handleRemoveUnit}
					onReorder={handleReorderUnits}
					onUpdateUnit={handleUpdateUnit}
					units={unitList}
				/>
			</Suspense>
		</div>
	);
}

export function DashboardPageClient({
	courseId,
	subdomain,
}: {
	courseId: Id<"courses">;
	subdomain: string;
}) {
	return (
		<div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
			<Authenticated>
				<DashboardContent courseId={courseId} subdomain={subdomain} />
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
