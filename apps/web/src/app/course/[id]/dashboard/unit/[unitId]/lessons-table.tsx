"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { GripVerticalIcon, MoreHorizontalIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
	TableBody as KiboTableBody,
	TableHead as KiboTableHead,
	TableHeader as KiboTableHeader,
	TableColumnHeader,
	TableHeaderGroup,
	TableProvider,
} from "@/components/ui/kibo-ui/table";
import { TableCell } from "@/components/ui/table";

type Lesson = {
	id: Id<"lessons">;
	name: string;
	isPublished: boolean;
	order: number;
	contentType: string;
};

type LessonsTableProps = {
	lessons: Lesson[];
	courseId: Id<"courses">;
	unitId: Id<"units">;
	onReorder: (data: { id: Id<"lessons">; position: number }[]) => Promise<void>;
	onUpdateLesson: (payload: {
		id: Id<"lessons">;
		data: Partial<{ isPublished: boolean; name: string }>;
	}) => Promise<void>;
	onRemoveLesson: (id: Id<"lessons">) => Promise<void>;
};

type ConfirmationDialog = {
	isOpen: boolean;
	title: string;
	description: string;
	action: () => void;
} | null;

function SortableLessonRow({
	row,
	courseId,
	unitId: _unitId,
	onUpdateLesson,
	onRemoveLesson,
}: {
	row: { id: string; original: Lesson };
	courseId: Id<"courses">;
	unitId: Id<"units">;
	onUpdateLesson: (payload: {
		id: Id<"lessons">;
		data: Partial<{ isPublished: boolean }>;
	}) => Promise<void>;
	onRemoveLesson: (id: Id<"lessons">) => Promise<void>;
}) {
	const lesson = row.original;
	const router = useRouter();
	const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>(null);

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: String(lesson.id),
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const handleUnpublish = useCallback(async () => {
		await onUpdateLesson({
			id: lesson.id,
			data: { isPublished: false },
		});
		setConfirmDialog(null);
	}, [onUpdateLesson, lesson.id]);

	const handleDelete = useCallback(async () => {
		await onRemoveLesson(lesson.id);
		setConfirmDialog(null);
	}, [onRemoveLesson, lesson.id]);

	const handlePublishToggle = useCallback(async () => {
		if (lesson.isPublished) {
			setConfirmDialog({
				isOpen: true,
				title: "Unpublish Lesson",
				description: `Are you sure you want to unpublish "${lesson.name}"? Students will no longer be able to access this lesson.`,
				action: () => void handleUnpublish(),
			});
		} else {
			await onUpdateLesson({
				id: lesson.id,
				data: { isPublished: true },
			});
		}
	}, [
		lesson.isPublished,
		lesson.name,
		lesson.id,
		onUpdateLesson,
		handleUnpublish,
	]);

	const handleDeleteClick = useCallback(() => {
		setConfirmDialog({
			isOpen: true,
			title: "Delete Lesson",
			description: `Are you sure you want to delete "${lesson.name}"? This action cannot be undone.`,
			action: () => void handleDelete(),
		});
	}, [lesson.name, handleDelete]);

	const handleRowClick = () => {
		router.push(`/course/${courseId}/dashboard/lesson/${lesson.id}`);
	};

	return (
		<>
			<tr
				className={`cursor-pointer transition-colors hover:bg-muted/50 ${
					isDragging ? "opacity-50" : ""
				}`}
				onClick={handleRowClick}
				ref={setNodeRef}
				style={style}
			>
				<TableCell className="p-0">
					<div className="flex w-full items-center gap-3 px-4 py-3">
						<button
							className="cursor-grab touch-none rounded p-1 hover:bg-muted"
							type="button"
							{...attributes}
							{...listeners}
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
						>
							<GripVerticalIcon className="h-4 w-4 text-muted-foreground" />
						</button>
						<div className="flex flex-col">
							<span className="font-medium">{lesson.name}</span>
							<div className="flex items-center gap-2">
								<Badge className="w-fit text-xs" variant="outline">
									{lesson.isPublished ? "Published" : "Draft"}
								</Badge>
								<span className="text-muted-foreground text-xs capitalize">
									{lesson.contentType.replace("_", " ")}
								</span>
							</div>
						</div>
					</div>
				</TableCell>
				<TableCell className="p-4 text-right">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								className="h-8 w-8 p-0"
								onClick={(e) => e.stopPropagation()}
								size="sm"
								variant="ghost"
							>
								<MoreHorizontalIcon className="h-4 w-4" />
								<span className="sr-only">Open menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={handlePublishToggle}>
								{lesson.isPublished ? "Unpublish" : "Publish"}
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive focus:text-destructive"
								onClick={handleDeleteClick}
							>
								<TrashIcon className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</TableCell>
			</tr>

			<Dialog
				onOpenChange={(open) => !open && setConfirmDialog(null)}
				open={confirmDialog?.isOpen ?? false}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{confirmDialog?.title}</DialogTitle>
						<DialogDescription>{confirmDialog?.description}</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button onClick={() => setConfirmDialog(null)} variant="outline">
							Cancel
						</Button>
						<Button onClick={confirmDialog?.action} variant="destructive">
							Confirm
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

export function LessonsTable({
	lessons,
	courseId,
	unitId,
	onReorder,
	onUpdateLesson,
	onRemoveLesson,
}: LessonsTableProps) {
	const [localLessons, setLocalLessons] = useState(lessons);
	const columns: ColumnDef<Lesson>[] = [
		{
			accessorKey: "name",
			header: ({ column }) => (
				<TableColumnHeader column={column} title="Lesson Name & Status" />
			),
		},
		{
			id: "actions",
			header: () => <div className="text-right">Actions</div>,
		},
	];

	const sensors = useSensors(
		useSensor(MouseSensor),
		useSensor(TouchSensor),
		useSensor(KeyboardSensor),
	);

	// Keep local copy in sync with server updates
	useEffect(() => {
		setLocalLessons(lessons);
	}, [lessons]);

	const handleDragEnd = useCallback(
		async ({ active, over }: DragEndEvent) => {
			if (!over || active.id === over.id) {
				return;
			}

			const oldIndex = localLessons.findIndex(
				(l) => String(l.id) === String(active.id),
			);
			const newIndex = localLessons.findIndex(
				(l) => String(l.id) === String(over.id),
			);

			if (oldIndex === -1 || newIndex === -1) {
				return;
			}

			const prev = localLessons;
			const reordered = arrayMove(localLessons, oldIndex, newIndex);

			// Optimistically update UI
			setLocalLessons(reordered);

			const data = reordered.map((l, index) => ({
				id: l.id,
				position: index,
			}));

			try {
				await onReorder(data);
			} catch {
				// Revert on error
				setLocalLessons(prev);
			}
		},
		[localLessons, onReorder],
	);

	if (localLessons.length === 0) {
		return (
			<div className="rounded-lg border py-12 text-center">
				<p className="text-muted-foreground">No lessons created yet.</p>
				<p className="mt-2 text-muted-foreground text-sm">
					Click &quot;Add Lesson&quot; to get started.
				</p>
			</div>
		);
	}

	return (
		<DndContext
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
			sensors={sensors}
		>
			<SortableContext
				items={localLessons.map((l) => String(l.id))}
				strategy={verticalListSortingStrategy}
			>
				<TableProvider
					className="rounded-lg"
					columns={columns}
					data={localLessons}
				>
					<KiboTableHeader>
						{({ headerGroup }) => (
							<TableHeaderGroup headerGroup={headerGroup} key={headerGroup.id}>
								{({ header }) => (
									<KiboTableHead header={header} key={header.id} />
								)}
							</TableHeaderGroup>
						)}
					</KiboTableHeader>
					<KiboTableBody>
						{({ row }) => (
							<SortableLessonRow
								courseId={courseId}
								unitId={unitId}
								key={row.id}
								onRemoveLesson={onRemoveLesson}
								onUpdateLesson={onUpdateLesson}
								row={row as unknown as { id: string; original: Lesson }}
							/>
						)}
					</KiboTableBody>
				</TableProvider>
			</SortableContext>
		</DndContext>
	);
}
