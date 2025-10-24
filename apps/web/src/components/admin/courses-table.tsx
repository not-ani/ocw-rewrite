"use client";

import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Doc } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useSite } from "@/lib/multi-tenant/context";

type Course = Doc<"courses">;

type CoursesTableProps = {
	courses: Course[];
};

type ConfirmationDialog = {
	isOpen: boolean;
	title: string;
	description: string;
	action: () => void;
} | null;

function CourseActionsCell({ course }: { course: Course }) {
	const router = useRouter();
	const { subdomain } = useSite();
	const updateStatus = useMutation(api.admin.updateCourseStatus);
	const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>(null);
	const [isUpdating, setIsUpdating] = useState(false);

	const handleStatusToggle = useCallback(async () => {
		setIsUpdating(true);
		try {
			await updateStatus({
				courseId: course._id,
				isPublic: !course.isPublic,
				school: subdomain,
			});
			toast.success(
				course.isPublic
					? "Course unpublished successfully"
					: "Course published successfully",
			);
			setConfirmDialog(null);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to update course status",
			);
		} finally {
			setIsUpdating(false);
		}
	}, [updateStatus, course._id, course.isPublic, subdomain]);

	const handleUnpublishClick = useCallback(() => {
		setConfirmDialog({
			isOpen: true,
			title: "Unpublish Course",
			description: `Are you sure you want to unpublish "${course.name}"? Students will no longer be able to access this course.`,
			action: () => void handleStatusToggle(),
		});
	}, [course.name, handleStatusToggle]);

	const handlePublishClick = useCallback(() => {
		handleStatusToggle();
	}, [handleStatusToggle]);

	const handleViewDashboard = useCallback(() => {
		router.push(`/course/${course._id}/dashboard`);
	}, [router, course._id]);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" disabled={isUpdating}>
						<MoreHorizontal className="h-4 w-4" />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={handleViewDashboard}>
						View Dashboard
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={
							course.isPublic ? handleUnpublishClick : handlePublishClick
						}
					>
						{course.isPublic ? "Unpublish" : "Publish"}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog
				open={confirmDialog?.isOpen ?? false}
				onOpenChange={(open) => !open && setConfirmDialog(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{confirmDialog?.title}</DialogTitle>
						<DialogDescription>{confirmDialog?.description}</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							onClick={() => setConfirmDialog(null)}
							variant="outline"
							disabled={isUpdating}
						>
							Cancel
						</Button>
						<Button
							onClick={confirmDialog?.action}
							variant="destructive"
							disabled={isUpdating}
						>
							{isUpdating ? "Processing..." : "Confirm"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

export function CoursesTable({ courses }: CoursesTableProps) {
	const router = useRouter();

	const columns: ColumnDef<Course>[] = [
		{
			accessorKey: "name",
			header: ({ column }) => (
				<TableColumnHeader column={column} title="Course Name" />
			),
			cell: ({ row }) => {
				const course = row.original;
				return (
					<div
						className="cursor-pointer space-y-1"
						onClick={() => router.push(`/course/${course._id}/dashboard`)}
					>
						<div className="font-medium">{course.name}</div>
						<div className="line-clamp-1 text-muted-foreground text-sm">
							{course.description}
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: "subjectId",
			header: ({ column }) => (
				<TableColumnHeader column={column} title="Subject" />
			),
			cell: ({ row }) => (
				<Badge variant="outline">{row.original.subjectId}</Badge>
			),
		},
		{
			accessorKey: "unitLength",
			header: ({ column }) => (
				<TableColumnHeader column={column} title="Units" />
			),
			cell: ({ row }) => (
				<div className="text-center">{row.original.unitLength}</div>
			),
		},
		{
			accessorKey: "isPublic",
			header: ({ column }) => (
				<TableColumnHeader column={column} title="Status" />
			),
			cell: ({ row }) => (
				<Badge variant={row.original.isPublic ? "default" : "secondary"}>
					{row.original.isPublic ? "Published" : "Unpublished"}
				</Badge>
			),
		},
		{
			id: "actions",
			header: () => <div className="text-right">Actions</div>,
			cell: ({ row }) => (
				<div className="flex justify-end">
					<CourseActionsCell course={row.original} />
				</div>
			),
		},
	];

	return (
		<TableProvider
			columns={columns}
			data={courses}
			className="rounded-lg border"
		>
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
