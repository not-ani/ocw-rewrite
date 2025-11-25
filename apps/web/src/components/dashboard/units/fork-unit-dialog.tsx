"use client";

import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Check, ChevronsUpDown, CopyIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useSite } from "@/lib/multi-tenant/context";
import { cn } from "@/lib/utils";

export function ForkUnitDialog({ courseId }: { courseId: Id<"courses"> }) {
	const [open, setOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const { subdomain } = useSite();
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
	const [isForking, setIsForking] = useState(false);

	const searchResults = useQuery(api.forking.searchPublicUnits, {
		term: searchTerm,
		limit: 10,
	});

	const forkUnit = useMutation(api.forking.forkUnit);

	const selectedUnit = searchResults?.find((u) => u._id === selectedUnitId);

	async function handleFork() {
		if (!selectedUnitId) return;
		setIsForking(true);
		try {
			await forkUnit({
				sourceUnitId: selectedUnitId as Id<"units">,
				targetCourseId: courseId,
				targetSchool: subdomain,
			});
			toast.success("Unit forked successfully!");
			setOpen(false);
			setSelectedUnitId(null);
			setSearchTerm("");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to fork unit",
			);
			console.error(error);
		} finally {
			setIsForking(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="secondary">
					<CopyIcon className="mr-2 h-4 w-4" />
					Fork Unit
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Fork a Unit</DialogTitle>
					<DialogDescription>
						Search for a public unit from another school to copy into your
						course.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<Popover open={searchOpen} onOpenChange={setSearchOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								aria-expanded={searchOpen}
								className="w-full justify-between"
							>
								{selectedUnit ? selectedUnit.name : "Search for a unit..."}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[550px] p-0">
							<Command shouldFilter={false}>
								<CommandInput
									placeholder="Search units..."
									value={searchTerm}
									onValueChange={setSearchTerm}
								/>
								<CommandList>
									<CommandEmpty>No units found.</CommandEmpty>
									<CommandGroup>
										{searchResults?.map((unit) => (
											<CommandItem
												key={unit._id}
												value={unit.name}
												onSelect={() => {
													setSelectedUnitId(unit._id);
													setSearchOpen(false);
												}}
											>
												<Check
													className={cn(
														"mr-2 h-4 w-4",
														selectedUnitId === unit._id
															? "opacity-100"
															: "opacity-0",
													)}
												/>
												<div className="flex flex-col">
													<span>{unit.name}</span>
													<span className="text-muted-foreground text-xs">
														{unit.courseSchool} • {unit.courseName}
													</span>
												</div>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>

					{selectedUnit && (
						<div className="space-y-2 rounded-md border p-4">
							<h3 className="font-semibold">Unit Details</h3>
							<div className="grid grid-cols-2 gap-2 text-sm">
								<div className="text-muted-foreground">Name:</div>
								<div>{selectedUnit.name}</div>
								<div className="text-muted-foreground">Course:</div>
								<div>{selectedUnit.courseName}</div>
								<div className="text-muted-foreground">School:</div>
								<div>{selectedUnit.courseSchool}</div>
								<div className="text-muted-foreground">Description:</div>
								<div className="col-span-2 line-clamp-3 text-muted-foreground">
									{selectedUnit.description}
								</div>
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							setOpen(false);
							setSelectedUnitId(null);
						}}
						disabled={isForking}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleFork}
						disabled={!selectedUnit || isForking}
					>
						{isForking ? (
							<>
								<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
								Forking...
							</>
						) : (
							"Fork Unit"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
