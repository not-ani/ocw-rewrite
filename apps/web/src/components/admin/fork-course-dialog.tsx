"use client";

import { api } from "@ocw/backend/convex/_generated/api";
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
import type { Id } from "@ocw/backend/convex/_generated/dataModel";

export function ForkCourseDialog() {
	const [open, setOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const { subdomain } = useSite();
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
	const [isForking, setIsForking] = useState(false);

	const searchResults = useQuery(api.forking.searchPublicCourses, {
		term: searchTerm,
		limit: 10,
	});

	const forkCourse = useMutation(api.forking.forkCourse);

	const selectedCourse = searchResults?.find((c) => c._id === selectedCourseId);

	async function handleFork() {
		if (!selectedCourseId) return;
		setIsForking(true);
		try {
			await forkCourse({
				sourceCourseId: selectedCourseId as Id<"courses">,
				targetSchool: subdomain,
			});
			toast.success("Course forked successfully!");
			setOpen(false);
			setSelectedCourseId(null);
			setSearchTerm("");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to fork course",
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
					Fork Course
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Fork a Course</DialogTitle>
					<DialogDescription>
						Search for a public course from another school to copy into your
						platform.
					</DialogDescription>
				</DialogHeader>

				<div className="py-4 space-y-4">
					<Popover open={searchOpen} onOpenChange={setSearchOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								aria-expanded={searchOpen}
								className="w-full justify-between"
							>
								{selectedCourse
									? selectedCourse.name
									: "Search for a course..."}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[550px] p-0">
							<Command shouldFilter={false}>
								<CommandInput
									placeholder="Search courses..."
									value={searchTerm}
									onValueChange={setSearchTerm}
								/>
								<CommandList>
									<CommandEmpty>
										No courses found. Try Searching For A Course
									</CommandEmpty>
									<CommandGroup>
										{searchResults?.map((course) => (
											<CommandItem
												key={course._id}
												value={course.name}
												onSelect={() => {
													setSelectedCourseId(course._id);
													setSearchOpen(false);
												}}
											>
												<Check
													className={cn(
														"mr-2 h-4 w-4",
														selectedCourseId === course._id
															? "opacity-100"
															: "opacity-0",
													)}
												/>
												<div className="flex flex-col">
													<span>{course.name}</span>
													<span className="text-xs text-muted-foreground">
														{course.school} • {course.unitLength} units
													</span>
												</div>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>

					{selectedCourse && (
						<div className="rounded-md border p-4 space-y-2">
							<h3 className="font-semibold">Course Details</h3>
							<div className="grid grid-cols-2 gap-2 text-sm">
								<div className="text-muted-foreground">Name:</div>
								<div>{selectedCourse.name}</div>
								<div className="text-muted-foreground">School:</div>
								<div>{selectedCourse.school}</div>
								<div className="text-muted-foreground">Units:</div>
								<div>{selectedCourse.unitLength}</div>
								<div className="text-muted-foreground">Description:</div>
								<div className="col-span-2 text-muted-foreground line-clamp-3">
									{selectedCourse.description}
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
							setSelectedCourseId(null);
						}}
						disabled={isForking}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleFork}
						disabled={!selectedCourse || isForking}
					>
						{isForking ? (
							<>
								<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
								Forking...
							</>
						) : (
							"Fork Course"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
