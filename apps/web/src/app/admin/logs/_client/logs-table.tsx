"use client";

import {
	BookOpenIcon,
	FileTextIcon,
	FolderIcon,
	PencilIcon,
	PlusIcon,
	RefreshCwIcon,
	TrashIcon,
	UserIcon,
} from "lucide-react";
import { memo, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@/components/ui/kibo-ui/table";
import {
	TableBody,
	TableCell,
	TableColumnHeader,
	TableHead,
	TableHeader,
	TableHeaderGroup,
	TableProvider,
	TableRow,
} from "@/components/ui/kibo-ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { type ClerkUser, type EnrichedLog, LOG_ACTION_LABELS, type LogAction } from "./types";

type LogsTableProps = {
	logs: EnrichedLog[];
	userMap: Map<string, ClerkUser>;
};

const ACTION_ICON_MAP: Record<
	string,
	{ icon: typeof PlusIcon; color: string }
> = {
	CREATE: { icon: PlusIcon, color: "text-emerald-500" },
	UPDATE: { icon: PencilIcon, color: "text-amber-500" },
	DELETE: { icon: TrashIcon, color: "text-rose-500" },
	REORDER: { icon: RefreshCwIcon, color: "text-blue-500" },
};

const ENTITY_ICON_MAP: Record<string, typeof FileTextIcon> = {
	LESSON: FileTextIcon,
	COURSE: BookOpenIcon,
	UNIT: FolderIcon,
	USER: UserIcon,
};

const VARIANT_MAP: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
	CREATE: "default",
	UPDATE: "secondary",
	DELETE: "destructive",
	REORDER: "outline",
};

// Cached DateTimeFormat instance for better performance
const dateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
	hour: "numeric",
	minute: "2-digit",
	hour12: true,
});

function getActionParts(action: LogAction) {
	const parts = action.split("_");
	const actionType = parts[0];
	const entityType = parts.slice(1).join("_");
	return { actionType, entityType };
}

const ActionBadge = memo(function ActionBadge({ action }: { action: LogAction }) {
	const { actionType, entityType } = getActionParts(action);
	const actionStyle = ACTION_ICON_MAP[actionType] ?? {
		icon: PencilIcon,
		color: "text-muted-foreground",
	};
	const EntityIcon = ENTITY_ICON_MAP[entityType] ?? FileTextIcon;
	const ActionIcon = actionStyle.icon;

	return (
		<Badge
			variant={VARIANT_MAP[actionType] ?? "outline"}
			className="gap-1.5 font-medium"
		>
			<ActionIcon className={cn("h-3 w-3", actionStyle.color)} />
			<EntityIcon className="h-3 w-3 text-muted-foreground" />
			<span>{LOG_ACTION_LABELS[action]}</span>
		</Badge>
	);
});

function formatDate(timestamp: number) {
	return dateFormatter.format(new Date(timestamp));
}

function formatRelativeTime(timestamp: number) {
	const now = Date.now();
	const diff = now - timestamp;

	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);

	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes}m ago`;
	if (hours < 24) return `${hours}h ago`;
	if (days < 7) return `${days}d ago`;
	return formatDate(timestamp);
}

function extractClerkId(userId: string) {
	// Extract the Clerk user ID from the tokenIdentifier (format: "issuer|userId")
	const parts = userId.split("|");
	return parts[parts.length - 1];
}

type UserCellProps = {
	userId: string;
	user: ClerkUser | undefined;
};

const UserCell = memo(function UserCell({ userId, user }: UserCellProps) {
	const clerkId = extractClerkId(userId);

	if (user) {
		const initials = user.fullName
			.split(" ")
			.map((n) => n[0])
			.join("")
			.slice(0, 2);

		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="flex items-center gap-2">
							<Avatar className="h-6 w-6">
								<AvatarImage src={user.imageUrl} alt={user.fullName} />
								<AvatarFallback className="text-[10px]">
									{initials}
								</AvatarFallback>
							</Avatar>
							<span className="text-sm font-medium">{user.fullName}</span>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p className="text-xs">{user.email}</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	// Fallback if user not found
	const displayId = clerkId.length > 12 ? `${clerkId.slice(0, 6)}...${clerkId.slice(-4)}` : clerkId;

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex items-center gap-2">
						<Avatar className="h-6 w-6">
							<AvatarFallback>
								<UserIcon className="h-3 w-3" />
							</AvatarFallback>
						</Avatar>
						<span className="text-sm text-muted-foreground">{displayId}</span>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<p className="font-mono text-xs">{userId}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
});

type TargetCellProps = {
	courseName?: string;
	unitName?: string;
	lessonName?: string;
};

const TargetCell = memo(function TargetCell({ courseName, unitName, lessonName }: TargetCellProps) {
	const targets = useMemo(() => {
		const result: string[] = [];
		if (courseName) result.push(`📚 ${courseName}`);
		if (unitName) result.push(`📁 ${unitName}`);
		if (lessonName) result.push(`📄 ${lessonName}`);
		return result;
	}, [courseName, unitName, lessonName]);

	if (targets.length === 0) {
		return <span className="text-muted-foreground">—</span>;
	}

	return (
		<div className="flex flex-col gap-0.5">
			{targets.map((target, i) => (
				<span key={i} className="text-sm">
					{target}
				</span>
			))}
		</div>
	);
});

type TimeCellProps = {
	timestamp: number;
};

const TimeCell = memo(function TimeCell({ timestamp }: TimeCellProps) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<span className="text-muted-foreground text-sm">
						{formatRelativeTime(timestamp)}
					</span>
				</TooltipTrigger>
				<TooltipContent>
					<p>{formatDate(timestamp)}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
});

export function LogsTable({ logs, userMap }: LogsTableProps) {
	// Derive a stable key that changes when users become available
	// This helps React know when we need to re-render cells with user data
	const usersLoaded = userMap.size > 0;

	// Column definitions - recreated when usersLoaded changes to force cell re-renders
	const columns: ColumnDef<EnrichedLog>[] = useMemo(
		() => [
			{
				accessorKey: "action",
				header: ({ column }) => (
					<TableColumnHeader column={column} title="Action" />
				),
				cell: ({ row }) => <ActionBadge action={row.original.action} />,
			},
			{
				accessorKey: "userId",
				header: ({ column }) => (
					<TableColumnHeader column={column} title="User" />
				),
				cell: ({ row }) => {
					const clerkId = extractClerkId(row.original.userId);
					const user = userMap.get(clerkId);
					return (
						<UserCell
							userId={row.original.userId}
							user={user}
						/>
					);
				},
			},
			{
				id: "target",
				header: ({ column }) => (
					<TableColumnHeader column={column} title="Target" />
				),
				cell: ({ row }) => (
					<TargetCell
						courseName={row.original.courseName}
						unitName={row.original.unitName}
						lessonName={row.original.lessonName}
					/>
				),
			},
			{
				accessorKey: "_creationTime",
				header: ({ column }) => (
					<TableColumnHeader column={column} title="Time" />
				),
				cell: ({ row }) => (
					<TimeCell
						timestamp={row.original.timestamp ?? row.original._creationTime}
					/>
				),
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally depend on usersLoaded to force re-render when users load
		[userMap, usersLoaded],
	);

	if (logs.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
				<FileTextIcon className="h-12 w-12 text-muted-foreground/50" />
				<h3 className="mt-4 font-semibold text-lg">No logs found</h3>
				<p className="mt-2 text-muted-foreground text-sm">
					Try adjusting your filters or check back later.
				</p>
			</div>
		);
	}

	return (
		<TableProvider columns={columns} data={logs} className="rounded-lg border">
			<TableHeader>
				{({ headerGroup }) => (
					<TableHeaderGroup key={headerGroup.id} headerGroup={headerGroup}>
						{({ header }) => <TableHead key={header.id} header={header} />}
					</TableHeaderGroup>
				)}
			</TableHeader>
			<TableBody>
				{({ row }) => (
					<TableRow key={row.id} row={row}>
						{({ cell }) => <TableCell key={cell.id} cell={cell} />}
					</TableRow>
				)}
			</TableBody>
		</TableProvider>
	);
}

