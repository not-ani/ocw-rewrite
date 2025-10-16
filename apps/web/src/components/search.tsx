"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { ArrowRightIcon, Loader2Icon, SearchIcon } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import { useSite } from "@/lib/multi-tenant/context";
import type { Route } from "next";

const KEYBOARD_SHORTCUT = "⌘K";
const DEBOUNCE_QUERY_MS = 200;
const MIN_QUERY_LENGTH = 2;

const COURSE_GROUP_LABEL = "Courses";
const UNIT_GROUP_LABEL = "Units";
const LESSON_GROUP_LABEL = "Lessons";

const SEARCH_PLACEHOLDER = "Search courses, units, or lessons...";

type CourseSearchResult = {
  type: "course";
  id: Id<"courses">;
  name: string;
  description: string;
  unitLength: number;
};

type UnitSearchResult = {
  type: "unit";
  id: Id<"units">;
  name: string;
  courseId: Id<"courses">;
  courseName: string;
};

type LessonSearchResult = {
  type: "lesson";
  id: Id<"lessons">;
  name: string;
  courseId: Id<"courses">;
  courseName: string;
  unitId: Id<"units">;
  unitName: string;
};

type SearchResult = CourseSearchResult | UnitSearchResult | LessonSearchResult;

function useKeyboardShortcut(toggle: () => void) {
  React.useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const isOpenShortcut =
        event.key === "k" && (event.metaKey || event.ctrlKey);
      if (isOpenShortcut) {
        event.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);
}

type ResultGroup = {
  label: string;
  items: SearchResult[];
};

function useGroupedResults(open: boolean, term: string) {
  const debouncedTerm = useDebouncedValue(term, DEBOUNCE_QUERY_MS);
  const meetsLengthRequirement = debouncedTerm.length >= MIN_QUERY_LENGTH;
  const shouldFetch = open && meetsLengthRequirement;
  const { subdomain } = useSite();

  const results = useQuery(
    api.courses.searchEntities,
    shouldFetch
      ? {
          term: debouncedTerm,
          school: subdomain,
        }
      : "skip",
  );

  const grouped = React.useMemo<ResultGroup[]>(() => {
    if (!results || results.length === 0) {
      return [];
    }

    const courses = results.filter(
      (item): item is CourseSearchResult => item.type === "course",
    );
    const units = results.filter(
      (item): item is UnitSearchResult => item.type === "unit",
    );
    const lessons = results.filter(
      (item): item is LessonSearchResult => item.type === "lesson",
    );

    return [
      courses.length > 0 && {
        label: COURSE_GROUP_LABEL,
        items: courses,
      },
      units.length > 0 && {
        label: UNIT_GROUP_LABEL,
        items: units,
      },
      lessons.length > 0 && {
        label: LESSON_GROUP_LABEL,
        items: lessons,
      },
    ].filter(Boolean) as ResultGroup[];
  }, [results]);

  return {
    grouped,
    debouncedTerm,
    isLoading: shouldFetch && results === undefined,
    hasQuery: meetsLengthRequirement,
  };
}

function SearchButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      className="border-input bg-background text-foreground placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 w-fit items-center gap-3 rounded-md border px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
      onClick={onOpen}
    >
      <SearchIcon
        className="text-muted-foreground/80"
        size={16}
        aria-hidden="true"
      />
      <span className="text-muted-foreground/70 font-normal">
        Search the catalog
      </span>
      <kbd className="bg-background text-muted-foreground/70 inline-flex h-5 max-h-full items-center rounded border px-1 text-[0.625rem] font-medium">
        {KEYBOARD_SHORTCUT}
      </kbd>
    </button>
  );
}

type SearchItem = ResultGroup["items"][number];

function getResultHref(item: SearchItem) {
  switch (item.type) {
    case "course":
      return `/course/${String(item.id)}`;
    case "unit":
      return `/course/${item.courseId}/${item.id}`;
    case "lesson":
      return `/course/${item.courseId}/${item.unitId}/${item.id}`;
    default:
      return "#";
  }
}

function getResultDescription(item: SearchItem) {
  switch (item.type) {
    case "course":
      return item.description;
    case "unit":
      return item.courseName;
    case "lesson":
      return `${item.courseName} • ${item.unitName}`;
    default:
      return undefined;
  }
}

function getResultBadge(item: SearchItem) {
  if (item.type === "course") {
    return `${item.unitLength} units`;
  }
  return undefined;
}

function SearchResultsList({
  groups,
  isLoading,
  hasQuery,
  onNavigate,
}: {
  groups: ResultGroup[];
  isLoading: boolean;
  hasQuery: boolean;
  onNavigate: (href: string) => void;
}) {
  if (!hasQuery) {
    return <CommandEmpty>Keep typing to search.</CommandEmpty>;
  }

  if (isLoading) {
    return (
      <CommandEmpty>
        <span className="flex items-center justify-center gap-2">
          <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
          Searching…
        </span>
      </CommandEmpty>
    );
  }

  if (groups.length === 0) {
    return <CommandEmpty>No results found. Try another query.</CommandEmpty>;
  }

  return (
    <>
      {groups.map((group) => (
        <CommandGroup key={group.label} heading={group.label}>
          {group.items.map((item) => {
            const href = getResultHref(item);
            const description = getResultDescription(item);
            const badge = getResultBadge(item);

            return (
              <CommandItem
                key={item.id}
                value={`${item.type}-${item.id}`}
                onSelect={() => onNavigate(href)}
              >
                <div className="flex min-w-0 flex-col">
                  <span className="line-clamp-1 font-medium text-foreground">
                    {item.name}
                  </span>
                  {description ? (
                    <span className="line-clamp-1 text-muted-foreground text-xs">
                      {description}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <ArrowRightIcon size={14} aria-hidden="true" />
                  {badge ? <span>{badge}</span> : null}
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
      ))}
    </>
  );
}

export function Search() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [term, setTerm] = React.useState("");

  const toggleDialog = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  useKeyboardShortcut(toggleDialog);

  const { grouped, debouncedTerm, isLoading, hasQuery } = useGroupedResults(
    open,
    term,
  );

  const navigateTo = React.useCallback(
    (href: string) => {
      router.push(href as Route);
      setOpen(false);
    },
    [router],
  );

  const handleSelectFirstResult = React.useCallback(() => {
    const topResult = grouped[0]?.items[0];
    if (!topResult) {
      return;
    }
    navigateTo(getResultHref(topResult));
  }, [grouped, navigateTo]);

  const resetState = React.useCallback(() => {
    setTerm("");
  }, []);

  const canSearch = term.length >= MIN_QUERY_LENGTH;

  return (
    <>
      <SearchButton onOpen={() => setOpen(true)} />
      <CommandDialog
        open={open}
        shouldFilter={false}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            resetState();
          }
        }}
      >
        <CommandInput
          placeholder={SEARCH_PLACEHOLDER}
          value={term}
          onValueChange={setTerm}
        />
        <CommandList>
          {canSearch ? (
            <SearchResultsList
              groups={grouped}
              isLoading={isLoading}
              hasQuery={hasQuery}
              onNavigate={navigateTo}
            />
          ) : (
            <CommandEmpty>Keep typing to search.</CommandEmpty>
          )}
        </CommandList>
        {grouped.length > 0 ? <CommandSeparator aria-hidden="true" /> : null}
        {grouped.length > 0 ? (
          <div className="flex items-center justify-between px-4 py-3 text-muted-foreground text-xs">
            <span>
              Showing top results for “{debouncedTerm}”. Press Enter to open the
              first match.
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs"
              onClick={handleSelectFirstResult}
              disabled={!grouped[0]?.items[0]}
            >
              Jump to top
            </button>
          </div>
        ) : null}
      </CommandDialog>
    </>
  );
}
