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

export function ForkLessonDialog({
	courseId,
	unitId,
}: {
	courseId: Id<"courses">;
	unitId: Id<"units">;
}) {
	const [open, setOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const { subdomain } = useSite();
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
	const [isForking, setIsForking] = useState(false);

	const searchResults = useQuery(api.forking.searchPublicLessons, {
		term: searchTerm,
		limit: 10,
	});

	const forkLesson = useMutation(api.forking.forkLesson);

	const selectedLesson = searchResults?.find((l) => l._id === selectedLessonId);

	async function handleFork() {
		if (!selectedLessonId) return;
		setIsForking(true);
		try {
			await forkLesson({
				sourceLessonId: selectedLessonId as Id<"lessons">,
				targetCourseId: courseId,
				targetUnitId: unitId,
				targetSchool: subdomain,
			});
			toast.success("Lesson forked successfully!");
			setOpen(false);
			setSelectedLessonId(null);
			setSearchTerm("");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to fork lesson",
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
					Fork Lesson
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Fork a Lesson</DialogTitle>
					<DialogDescription>
						Search for a public lesson from another school to copy into your
						unit.
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
								{selectedLesson
									? selectedLesson.name
									: "Search for a lesson..."}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[550px] p-0">
							<Command shouldFilter={false}>
								<CommandInput
									placeholder="Search lessons..."
									value={searchTerm}
									onValueChange={setSearchTerm}
								/>
								<CommandList>
									<CommandEmpty>No lessons found.</CommandEmpty>
									<CommandGroup>
										{searchResults?.map((lesson) => (
											<CommandItem
												key={lesson._id}
												value={lesson.name}
												onSelect={() => {
													setSelectedLessonId(lesson._id);
													setSearchOpen(false);
												}}
											>
												<Check
													className={cn(
														"mr-2 h-4 w-4",
														selectedLessonId === lesson._id
															? "opacity-100"
															: "opacity-0",
													)}
												/>
												<div className="flex flex-col">
													<span>{lesson.name}</span>
													<span className="text-muted-foreground text-xs">
														{lesson.school} • {lesson.courseName} •{" "}
														{lesson.unitName}
													</span>
												</div>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>

					{selectedLesson && (
						<div className="space-y-2 rounded-md border p-4">
							<h3 className="font-semibold">Lesson Details</h3>
							<div className="grid grid-cols-2 gap-2 text-sm">
								<div className="text-muted-foreground">Name:</div>
								<div>{selectedLesson.name}</div>
								<div className="text-muted-foreground">Unit:</div>
								<div>{selectedLesson.unitName}</div>
								<div className="text-muted-foreground">Course:</div>
								<div>{selectedLesson.courseName}</div>
								<div className="text-muted-foreground">School:</div>
								<div>{selectedLesson.school}</div>
								<div className="text-muted-foreground">Type:</div>
								<div>{selectedLesson.contentType}</div>
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
							setSelectedLessonId(null);
						}}
						disabled={isForking}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleFork}
						disabled={!selectedLesson || isForking}
					>
						{isForking ? (
							<>
								<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
								Forking...
							</>
						) : (
							"Fork Lesson"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
