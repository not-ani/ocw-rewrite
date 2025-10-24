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
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
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

type Unit = {
	id: Id<"units">;
	name: string;
	isPublished: boolean;
	courseId: Id<"courses">;
	order: number;
};

type UnitsTableProps = {
	units: Unit[];
	courseId: Id<"courses">;
	onReorder: (data: { id: Id<"units">; position: number }[]) => Promise<void>;
	onUpdateUnit: (payload: {
		id: Id<"units">;
		data: Partial<{ isPublished: boolean }>;
	}) => Promise<void>;
	onRemoveUnit: (id: Id<"units">) => Promise<void>;
};

type ConfirmationDialog = {
	isOpen: boolean;
	title: string;
	description: string;
	action: () => void;
} | null;

function SortableUnitRow({
	row,
	courseId,
	onUpdateUnit,
	onRemoveUnit,
}: {
	row: { id: string; original: Unit };
	courseId: Id<"courses">;
	onUpdateUnit: (payload: {
		id: Id<"units">;
		data: Partial<{ isPublished: boolean }>;
	}) => Promise<void>;
	onRemoveUnit: (id: Id<"units">) => Promise<void>;
}) {
	const unit = row.original;
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
		id: String(unit.id),
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const handleUnpublish = useCallback(async () => {
		await onUpdateUnit({
			id: unit.id,
			data: { isPublished: false },
		});
		setConfirmDialog(null);
	}, [onUpdateUnit, unit.id]);

	const handleDelete = useCallback(async () => {
		await onRemoveUnit(unit.id);
		setConfirmDialog(null);
	}, [onRemoveUnit, unit.id]);

	const handlePublishToggle = useCallback(async () => {
		if (unit.isPublished) {
			setConfirmDialog({
				isOpen: true,
				title: "Unpublish Unit",
				description: `Are you sure you want to unpublish "${unit.name}"? Students will no longer be able to access this unit.`,
				action: () => void handleUnpublish(),
			});
		} else {
			await onUpdateUnit({
				id: unit.id,
				data: { isPublished: true },
			});
		}
	}, [unit.isPublished, unit.name, unit.id, onUpdateUnit, handleUnpublish]);

	const handleDeleteClick = useCallback(() => {
		setConfirmDialog({
			isOpen: true,
			title: "Delete Unit",
			description: `Are you sure you want to delete "${unit.name}"? This action cannot be undone and will also delete all lessons in this unit.`,
			action: () => void handleDelete(),
		});
	}, [unit.name, handleDelete]);

	return (
		<>
			<tr
				className={`transition-colors hover:bg-muted/50 ${
					isDragging ? "opacity-50" : ""
				}`}
				onClick={() =>
					router.push(`/course/${courseId}/dashboard/unit/${unit.id}`)
				}
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
							<span className="font-medium">{unit.name}</span>
							<Badge className="w-fit text-xs" variant={"outline"}>
								{unit.isPublished ? "Published" : "Draft"}
							</Badge>
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
								{unit.isPublished ? "Unpublish" : "Publish"}
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

export function UnitsTable({
	units,
	courseId,
	onReorder,
	onUpdateUnit,
	onRemoveUnit,
}: UnitsTableProps) {
	const [localUnits, setLocalUnits] = useState(units);
	const columns: ColumnDef<Unit>[] = [
		{
			accessorKey: "name",
			header: ({ column }) => (
				<TableColumnHeader column={column} title="Unit Name & Status" />
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
		setLocalUnits(units);
	}, [units]);

	const handleDragEnd = useCallback(
		async ({ active, over }: DragEndEvent) => {
			if (!over || active.id === over.id) {
				return;
			}

			const oldIndex = localUnits.findIndex(
				(u) => String(u.id) === String(active.id),
			);
			const newIndex = localUnits.findIndex(
				(u) => String(u.id) === String(over.id),
			);

			if (oldIndex === -1 || newIndex === -1) {
				return;
			}

			const prev = localUnits;
			const reordered = arrayMove(localUnits, oldIndex, newIndex);

			// Optimistically update UI
			setLocalUnits(reordered);

			const data = reordered.map((u, index) => ({
				id: u.id,
				position: index,
			}));

			try {
				await onReorder(data);
			} catch {
				// Revert on error
				setLocalUnits(prev);
			}
		},
		[localUnits, onReorder],
	);

	if (localUnits.length === 0) {
		return (
			<div className="py-8 text-center">
				<p className="text-muted-foreground">No units created yet.</p>
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
				items={localUnits.map((u) => String(u.id))}
				strategy={verticalListSortingStrategy}
			>
				<TableProvider
					className="rounded-lg"
					columns={columns}
					data={localUnits}
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
							<SortableUnitRow
								courseId={courseId}
								key={row.id}
								onRemoveUnit={onRemoveUnit}
								onUpdateUnit={onUpdateUnit}
								row={row as unknown as { id: string; original: Unit }}
							/>
						)}
					</KiboTableBody>
				</TableProvider>
			</SortableContext>
		</DndContext>
	);
}
