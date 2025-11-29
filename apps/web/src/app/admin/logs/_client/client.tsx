"use client";

import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { Authenticated, useQuery } from "convex/react";
import { FileTextIcon, Loader2, RefreshCwIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogsFilters } from "./logs-filters";
import { LogsTable } from "./logs-table";
import type { ClerkUser, EnrichedLog, LogAction, LogFilters } from "./types";
import { useClerkUsers } from "./use-clerk-users";

type LogsPageClientProps = {
	school: string;
};

const DEFAULT_FILTERS: LogFilters = {
	action: "all",
	userId: "all",
	courseId: "all",
	startDate: undefined,
	endDate: undefined,
};

export function LogsPageClient({ school }: LogsPageClientProps) {
	return (
		<Authenticated>
			<LogsPageClientContent school={school} />
		</Authenticated>
	);
}

function LogsPageClientContent({ school }: LogsPageClientProps) {
	const [filters, setFilters] = useState<LogFilters>(DEFAULT_FILTERS);
	const [limit, setLimit] = useState(50);

	// Fetch Clerk users for displaying names
	const clerkUsers = useClerkUsers();

	// Create a map from Clerk ID to user for quick lookup
	const userMap = useMemo(() => {
		const map = new Map<string, ClerkUser>();
		for (const user of clerkUsers) {
			map.set(user.clerkId, user);
		}
		return map;
	}, [clerkUsers]);

	// Build query args based on filters
	const queryArgs = useMemo(() => {
		const args: {
			school: string;
			action?: LogAction;
			courseId?: Id<"courses">;
			startDate?: number;
			endDate?: number;
			limit: number;
		} = {
			school,
			limit,
		};

		if (filters.action !== "all") {
			args.action = filters.action;
		}

		if (filters.courseId !== "all") {
			args.courseId = filters.courseId;
		}

		if (filters.startDate) {
			args.startDate = filters.startDate.getTime();
		}

		if (filters.endDate) {
			// Set end date to end of day
			const endOfDay = new Date(filters.endDate);
			endOfDay.setHours(23, 59, 59, 999);
			args.endDate = endOfDay.getTime();
		}

		return args;
	}, [school, filters, limit]);

	const logs = useQuery(api.logs.getLogs, queryArgs);

	const handleFiltersChange = useCallback((newFilters: LogFilters) => {
		setFilters(newFilters);
	}, []);

	const handleLoadMore = useCallback(() => {
		setLimit((prev) => prev + 50);
	}, []);

	const isLoading = logs === undefined;

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
				<div className="space-y-1">
					<h1 className="font-bold text-3xl">Activity Logs</h1>
					<p className="text-muted-foreground">
						View and filter all activity logs across the platform
					</p>
				</div>
				<div className="flex items-center gap-2 text-muted-foreground text-sm">
					<FileTextIcon className="h-4 w-4" />
					<span>
						{isLoading
							? "Loading..."
							: `${logs?.length ?? 0} log${logs?.length === 1 ? "" : "s"}`}
					</span>
				</div>
			</div>

			{/* Filters */}
			<LogsFilters
				school={school}
				filters={filters}
				onFiltersChange={handleFiltersChange}
				clerkUsers={clerkUsers}
			/>

			{/* Table */}
			{isLoading ? (
				<div className="flex items-center justify-center rounded-lg border border-dashed p-12">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			) : (
				<>
					<LogsTable logs={logs as EnrichedLog[]} userMap={userMap} />

					{/* Load More */}
					{logs && logs.length >= limit && (
						<div className="flex justify-center pt-4">
							<Button
								variant="outline"
								onClick={handleLoadMore}
								className="gap-2"
							>
								<RefreshCwIcon className="h-4 w-4" />
								Load More
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
}

