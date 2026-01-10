/** biome-ignore-all lint/a11y/useButtonType: this is how recommended in docs */
"use client";

import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
	ArrowRightIcon,
	BookOpenIcon,
	FileTextIcon,
	FolderPlusIcon,
	Loader2Icon,
	SearchIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { CreateLessonInlineForm } from "@/components/dashboard/command/create-lesson-form";
import { CreateUnitInlineForm } from "@/components/dashboard/command/create-unit-form";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@ocw/ui/command";
import { useDebouncedValue } from "@/hooks/use-debounce";

type CommandMode = "search" | "create-unit" | "create-lesson";

export default function DashboardCommand() {
	const [open, setOpen] = React.useState(false);
	const [inputValue, setInputValue] = React.useState("");
	const [mode, setMode] = React.useState<CommandMode>("search");
	const debouncedSearch = useDebouncedValue(inputValue, 300);
	const router = useRouter();
	const pathname = usePathname();

	const courseId = React.useMemo(() => {
		const parts = pathname.split("/").filter(Boolean);
		if (parts[0] === "course" && parts[1]) {
			return parts[1] as Id<"courses">;
		}
		return null;
	}, [pathname]);

	React.useEffect(() => {
		if (!open) {
			setMode("search");
			setInputValue("");
		}
	}, [open]);

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	// Search queries
	const units = useQuery(
		api.units.searchByCourse,
		courseId && debouncedSearch.trim() && mode === "search"
			? { courseId, searchTerm: debouncedSearch }
			: "skip",
	);

	const lessons = useQuery(
		api.lesson.searchByCourse,
		courseId && debouncedSearch.trim() && mode === "search"
			? { courseId, searchTerm: debouncedSearch }
			: "skip",
	);

	const isSearching =
		courseId &&
		debouncedSearch.trim() !== "" &&
		mode === "search" &&
		(units === undefined || lessons === undefined);

	const handleNavigateToUnit = (unitId: Id<"units">) => {
		router.push(`/course/${courseId}/dashboard/unit/${unitId}`);
		setOpen(false);
	};

	const handleNavigateToLesson = (lessonId: Id<"lessons">) => {
		router.push(`/course/${courseId}/dashboard/lesson/${lessonId}`);
		setOpen(false);
	};

	const handleCommandSelect = (value: string) => {
		if (value === "create-unit") {
			setMode("create-unit");
			setInputValue("");
		} else if (value === "create-lesson") {
			setMode("create-lesson");
			setInputValue("");
		}
	};

	const handleSuccess = () => {
		setOpen(false);
		setMode("search");
		setInputValue("");
	};

	if (!courseId) {
		return null;
	}

	return (
		<>
			<button
				className="inline-flex h-9 w-fit rounded-md border border-input bg-background px-3 py-2 text-foreground text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
				onClick={() => setOpen(true)}
			>
				<span className="flex grow items-center">
					<SearchIcon
						className="-ms-1 me-3 text-muted-foreground/80"
						size={16}
						aria-hidden="true"
					/>
					<span className="font-normal text-muted-foreground/70">Search</span>
				</span>
				<kbd className="-me-1 ms-12 inline-flex h-5 max-h-full items-center rounded border bg-background px-1 font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70">
					⌘K
				</kbd>
			</button>

			<CommandDialog shouldFilter={false} open={open} onOpenChange={setOpen}>
				{mode === "search" && (
					<>
						<CommandInput
							placeholder="Search units, lessons, or type a command..."
							value={inputValue}
							onValueChange={setInputValue}
						/>
						<CommandList>
							<CommandEmpty>
								{isSearching ? (
									<div className="flex flex-col items-center gap-2 py-6">
										<Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
										<p className="text-muted-foreground text-sm">
											Searching...
										</p>
									</div>
								) : (
									<div className="py-6 text-center">
										<p className="text-muted-foreground text-sm">
											{debouncedSearch.trim()
												? "No results found."
												: "Type to search or select a quick action below."}
										</p>
									</div>
								)}
							</CommandEmpty>

							<CommandGroup heading="Quick Actions">
								<CommandItem
									onSelect={() => handleCommandSelect("create-unit")}
									value="create-unit"
								>
									<FolderPlusIcon
										size={16}
										className="opacity-60"
										aria-hidden="true"
									/>
									<span>Create New Unit</span>
								</CommandItem>
								<CommandItem
									onSelect={() => handleCommandSelect("create-lesson")}
									value="create-lesson"
								>
									<FileTextIcon
										size={16}
										className="opacity-60"
										aria-hidden="true"
									/>
									<span>Create New Lesson</span>
								</CommandItem>
							</CommandGroup>

							{units?.length || lessons?.length ? (
								<>
									<CommandSeparator />

									{units && units.length > 0 && (
										<CommandGroup heading="Units">
											{units.map((unit) => (
												<CommandItem
													key={unit.id}
													onSelect={() => handleNavigateToUnit(unit.id)}
													value={`unit-${unit.id}`}
												>
													<FolderPlusIcon
														size={16}
														className="opacity-60"
														aria-hidden="true"
													/>
													<span>{unit.name}</span>
													<ArrowRightIcon
														size={14}
														className="ml-auto opacity-40"
														aria-hidden="true"
													/>
												</CommandItem>
											))}
										</CommandGroup>
									)}

									{lessons && lessons.length > 0 && (
										<CommandGroup heading="Lessons">
											{lessons.map((lesson) => (
												<CommandItem
													key={lesson.id}
													onSelect={() => handleNavigateToLesson(lesson.id)}
													value={`lesson-${lesson.id}`}
												>
													<BookOpenIcon
														size={16}
														className="opacity-60"
														aria-hidden="true"
													/>
													<div className="flex flex-col">
														<span>{lesson.name}</span>
														<span className="text-muted-foreground text-xs">
															in {lesson.unitName}
														</span>
													</div>
													<ArrowRightIcon
														size={14}
														className="ml-auto opacity-40"
														aria-hidden="true"
													/>
												</CommandItem>
											))}
										</CommandGroup>
									)}
								</>
							) : null}
						</CommandList>
					</>
				)}

				{mode === "create-unit" && (
					<CreateUnitInlineForm
						courseId={courseId}
						onSuccess={handleSuccess}
						onCancel={() => setMode("search")}
					/>
				)}

				{mode === "create-lesson" && (
					<CreateLessonInlineForm
						courseId={courseId}
						onSuccess={handleSuccess}
						onCancel={() => setMode("search")}
					/>
				)}
			</CommandDialog>
		</>
	);
}
