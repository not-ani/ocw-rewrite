"use client";

import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
	CalendarIcon,
	FilterIcon,
	FilterXIcon,
	UserIcon,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
	type ClerkUser,
	LOG_ACTION_CATEGORIES,
	LOG_ACTION_LABELS,
	type LogAction,
	type LogFilters,
} from "./types";

type LogsFiltersProps = {
	school: string;
	filters: LogFilters;
	onFiltersChange: (filters: LogFilters) => void;
	clerkUsers: ClerkUser[];
};

export function LogsFilters({
	school,
	filters,
	onFiltersChange,
	clerkUsers,
}: LogsFiltersProps) {
	const courses = useQuery(api.admin.getAllCourses, { school });

	const handleActionChange = useCallback(
		(value: string) => {
			onFiltersChange({
				...filters,
				action: value as LogAction | "all",
			});
		},
		[filters, onFiltersChange],
	);

	const handleCourseChange = useCallback(
		(value: string) => {
			onFiltersChange({
				...filters,
				courseId: value as Id<"courses"> | "all",
			});
		},
		[filters, onFiltersChange],
	);

	const handleUserChange = useCallback(
		(value: string) => {
			onFiltersChange({
				...filters,
				userId: value,
			});
		},
		[filters, onFiltersChange],
	);

	// Get the selected user's name for display
	const selectedUserName = useMemo(() => {
		if (filters.userId === "all") return null;
		// Extract clerk ID from token identifier
		const clerkId = filters.userId.split("|").pop();
		const user = clerkUsers.find((u) => u.id === clerkId);
		return user?.fullName ?? null;
	}, [filters.userId, clerkUsers]);

	const handleStartDateChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			onFiltersChange({
				...filters,
				startDate: value ? new Date(value) : undefined,
			});
		},
		[filters, onFiltersChange],
	);

	const handleEndDateChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			onFiltersChange({
				...filters,
				endDate: value ? new Date(value) : undefined,
			});
		},
		[filters, onFiltersChange],
	);

	const handleClearFilters = useCallback(() => {
		onFiltersChange({
			action: "all",
			userId: "all",
			courseId: "all",
			startDate: undefined,
			endDate: undefined,
		});
	}, [onFiltersChange]);

	const hasActiveFilters = useMemo(() => {
		return (
			filters.action !== "all" ||
			filters.userId !== "all" ||
			filters.courseId !== "all" ||
			filters.startDate !== undefined ||
			filters.endDate !== undefined
		);
	}, [filters]);

	const formatDateForInput = (date: Date | undefined) => {
		if (!date) return "";
		return date.toISOString().split("T")[0];
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center gap-3">
				{/* Action Filter */}
				<Select value={filters.action} onValueChange={handleActionChange}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="All Actions" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Actions</SelectItem>
						<SelectSeparator />
						{Object.entries(LOG_ACTION_CATEGORIES).map(
							([category, actions]) => (
								<SelectGroup key={category}>
									<SelectLabel>{category}</SelectLabel>
									{actions.map((action) => (
										<SelectItem key={action} value={action}>
											{LOG_ACTION_LABELS[action]}
										</SelectItem>
									))}
								</SelectGroup>
							),
						)}
					</SelectContent>
				</Select>

				{/* User Filter */}
				<Select value={filters.userId} onValueChange={handleUserChange}>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="All Users">
							{filters.userId === "all" ? (
								"All Users"
							) : (
								<span className="flex items-center gap-2">
									<UserIcon className="h-3 w-3" />
									{selectedUserName ?? "Unknown User"}
								</span>
							)}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Users</SelectItem>
						<SelectSeparator />
						{clerkUsers.map((user) => (
							<SelectItem
								key={user.id}
								value={`https://clerk.ocw.college|${user.id}`}
							>
								<span className="flex items-center gap-2">
									<Avatar className="h-5 w-5">
										<AvatarImage src={user.imageUrl} alt={user.fullName} />
										<AvatarFallback className="text-[10px]">
											{user.fullName
												.split(" ")
												.map((n) => n[0])
												.join("")
												.slice(0, 2)}
										</AvatarFallback>
									</Avatar>
									{user.fullName}
								</span>
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{/* Course Filter */}
				<Select value={filters.courseId} onValueChange={handleCourseChange}>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="All Courses" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Courses</SelectItem>
						<SelectSeparator />
						{courses?.map((course) => (
							<SelectItem key={course._id} value={course._id}>
								{course.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{/* Date Range Filters */}
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn(
								"justify-start text-left font-normal",
								(filters.startDate || filters.endDate) && "text-foreground",
							)}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{filters.startDate || filters.endDate ? (
								<span>
									{filters.startDate
										? formatDateForInput(filters.startDate)
										: "Start"}{" "}
									→{" "}
									{filters.endDate
										? formatDateForInput(filters.endDate)
										: "End"}
								</span>
							) : (
								<span className="text-muted-foreground">Date Range</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-4" align="start">
						<div className="space-y-4">
							<div className="space-y-2">
								<label htmlFor="start-date" className="font-medium text-sm">Start Date</label>
								<Input
									id="start-date"
									type="date"
									value={formatDateForInput(filters.startDate)}
									onChange={handleStartDateChange}
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="end-date" className="font-medium text-sm">End Date</label>
								<Input
									id="end-date"
									type="date"
									value={formatDateForInput(filters.endDate)}
									onChange={handleEndDateChange}
								/>
							</div>
						</div>
					</PopoverContent>
				</Popover>

				{/* Clear Filters */}
				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="sm"
						onClick={handleClearFilters}
						className="text-muted-foreground hover:text-foreground"
					>
						<FilterXIcon className="mr-2 h-4 w-4" />
						Clear Filters
					</Button>
				)}
			</div>

			{/* Active Filters Summary */}
			{hasActiveFilters && (
				<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
					<FilterIcon className="h-4 w-4" />
					<span>Filtering by:</span>
					{filters.action !== "all" && (
						<span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
							{LOG_ACTION_LABELS[filters.action]}
						</span>
					)}
					{filters.userId !== "all" && (
						<span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
							{selectedUserName ?? "User"}
						</span>
					)}
					{filters.courseId !== "all" && (
						<span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
							{courses?.find((c) => c._id === filters.courseId)?.name ??
								"Course"}
						</span>
					)}
					{(filters.startDate || filters.endDate) && (
						<span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
							Date Range
						</span>
					)}
				</div>
			)}
		</div>
	);
}

