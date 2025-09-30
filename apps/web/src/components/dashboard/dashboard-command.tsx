"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import {
  SearchIcon,
  FolderPlusIcon,
  FileTextIcon,
  Loader2Icon,
  ArrowRightIcon,
  BookOpenIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateUnitInlineForm } from "@/components/dashboard/command/create-unit-form";
import { CreateLessonInlineForm } from "@/components/dashboard/command/create-lesson-form";

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
      : "skip"
  );

  const lessons = useQuery(
    api.lesson.searchByCourse,
    courseId && debouncedSearch.trim() && mode === "search"
      ? { courseId, searchTerm: debouncedSearch }
      : "skip"
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
        className="border-input bg-background text-foreground placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 w-fit rounded-md border px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
        onClick={() => setOpen(true)}
      >
        <span className="flex grow items-center">
          <SearchIcon
            className="text-muted-foreground/80 -ms-1 me-3"
            size={16}
            aria-hidden="true"
          />
          <span className="text-muted-foreground/70 font-normal">Search</span>
        </span>
        <kbd className="bg-background text-muted-foreground/70 ms-12 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
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
                    <p className="text-sm text-muted-foreground">Searching...</p>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-sm text-muted-foreground">
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

              {(units?.length || lessons?.length) ? (
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
                            <span className="text-xs text-muted-foreground">
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