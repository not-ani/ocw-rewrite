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
import { Avatar, AvatarFallback, AvatarImage } from "@ocw/ui/avatar";
import { Badge } from "@ocw/ui/badge";
import type { ColumnDef } from "@ocw/ui/kibo-ui/table";
import {
	TableBody,
	TableCell,
	TableColumnHeader,
	TableHead,
	TableHeader,
	TableHeaderGroup,
	TableProvider,
	TableRow,
} from "@ocw/ui/kibo-ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@ocw/ui/tooltip";
import { cn } from "@/lib/utils";
import { LOG_ACTION_LABELS } from "./types";
import type { ClerkUser, EnrichedLog, LogAction } from "./types";

interface LogsTableProps {
	logs: EnrichedLog[];
	userMap: Map<string, ClerkUser>;
}

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

const VARIANT_MAP: Record<
	string,
	"default" | "secondary" | "destructive" | "outline"
> = {
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
	timeZone: "UTC",
});

function getActionParts(action: LogAction) {
	const [actionType = "", ...parts] = action.split("_");
	const entityType = parts.join("_");
	return { actionType, entityType };
}

function ActionBadge({ action }: {
	action: LogAction;
}) {
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
}

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
	return userId.split("|").at(-1) ?? userId;
}

interface UserCellProps {
	userId: string;
	user: ClerkUser | undefined;
}

function UserCell({ userId, user }: UserCellProps) {
	const clerkId = extractClerkId(userId);

	if (user) {
		const initials = user.fullName
			.split(" ")
			.map((namePart) => namePart[0] ?? "")
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
							<span className="font-medium text-sm">{user.fullName}</span>
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
	const displayId =
		clerkId.length > 12
			? `${clerkId.slice(0, 6)}...${clerkId.slice(-4)}`
			: clerkId;

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
						<span className="text-muted-foreground text-sm">{displayId}</span>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<p className="font-mono text-xs">{userId}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

interface TargetCellProps {
	courseName?: string;
	unitName?: string;
	lessonName?: string;
}

function TargetCell({
	courseName,
	unitName,
	lessonName,
}: TargetCellProps) {
	const targets: string[] = [];
	if (courseName) targets.push(`📚 ${courseName}`);
	if (unitName) targets.push(`📁 ${unitName}`);
	if (lessonName) targets.push(`📄 ${lessonName}`);

	if (targets.length === 0) {
		return <span className="text-muted-foreground">—</span>;
	}

	return (
		<div className="flex flex-col gap-0.5">
			{targets.map((target) => (
				<span key={target} className="text-sm">
					{target}
				</span>
			))}
		</div>
	);
}

interface TimeCellProps {
	timestamp: number;
}

function TimeCell({ timestamp }: TimeCellProps) {
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
}

export function LogsTable({ logs, userMap }: LogsTableProps) {
	const columns: ColumnDef<EnrichedLog>[] = [
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
					return <UserCell userId={row.original.userId} user={user} />;
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
	];

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
