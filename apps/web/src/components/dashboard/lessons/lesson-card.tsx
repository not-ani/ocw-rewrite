import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LessonRow } from "./lesson-row";
import { Loader2 } from "lucide-react";
import { useSite } from "@/lib/multi-tenant/context";

export function LessonsCard({
  selectedUnitId,
  onCreateLesson,
  onTogglePublish,
  onDeleteLesson,
  onReorderLesson,
  onUpdateEmbed,
}: {
  courseId: Id<"courses">;
  selectedUnitId: Id<"units"> | null;
  onCreateLesson: (payload: {
    unitId: Id<"units">;
    name: string;
    embedRaw?: string;
  }) => Promise<void>;
  onTogglePublish: (data: {
    id: Id<"lessons">;
    isPublished?: boolean;
  }) => Promise<void>;
  onDeleteLesson: (id: Id<"lessons">) => Promise<void>;
  onReorderLesson: (payload: {
    unitId: Id<"units">;
    data: { id: Id<"lessons">; position: number }[];
  }) => Promise<void>;
  onUpdateEmbed: (lessonId: Id<"lessons">, raw: string) => Promise<void>;
}) {
  const { subdomain } = useSite();
  const [newLessonName, setNewLessonName] = useState("");
  const [newLessonEmbed, setNewLessonEmbed] = useState("");

  const lessons = useQuery(
    api.lesson.getByUnit,
    selectedUnitId
      ? ({ unitId: selectedUnitId, school: subdomain } as { unitId: Id<"units">; school: string })
      : ("skip" as const),
  );

  const lessonList = useMemo(() => lessons ?? [], [lessons]);
  const lessonIds = useMemo(
    () => lessonList.map((l) => String(l.id)),
    [lessonList],
  );

  const handleAdd = useCallback(async () => {
    if (!selectedUnitId) {
      return;
    }
    const name = newLessonName.trim();
    if (!name) {
      return;
    }
    await onCreateLesson({
      unitId: selectedUnitId,
      name,
      embedRaw: newLessonEmbed || undefined,
    });
    setNewLessonName("");
    setNewLessonEmbed("");
  }, [newLessonName, newLessonEmbed, selectedUnitId, onCreateLesson]);

  const handleReorder = useCallback(
    async (oldIndex: number, newIndex: number) => {
      if (oldIndex < 0 || newIndex < 0 || !selectedUnitId) {
        return;
      }
      const next = arrayMove(lessonList, oldIndex, newIndex);
      const payload = next.map((l, index) => ({
        id: l.id as Id<"lessons">,
        position: index,
      }));
      await onReorderLesson({ unitId: selectedUnitId, data: payload });
    },
    [lessonList, onReorderLesson, selectedUnitId],
  );

  if (!selectedUnitId) {
    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base">Lessons</CardTitle>
            <CardDescription>
              Pick a unit to manage lessons, drag to reorder, paste embeds.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Select a unit to view lessons.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (lessons === undefined) {
    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base">Lessons</CardTitle>
            <CardDescription>
              Pick a unit to manage lessons, drag to reorder, paste embeds.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-28 items-center justify-center">
            <Loader2 className="animate-spin" size={24} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">Lessons</CardTitle>
          <CardDescription>
            Pick a unit to manage lessons, drag to reorder, paste embeds.
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="w-56"
            onChange={(e) => setNewLessonName(e.target.value)}
            placeholder="New lesson name"
            value={newLessonName}
          />
          <Input
            className="w-72"
            onChange={(e) => setNewLessonEmbed(e.target.value)}
            placeholder="Optional: iframe or URL"
            value={newLessonEmbed}
          />
          <Button onClick={handleAdd} type="button">
            Add lesson
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            const { active, over } = e;
            if (!(active && over) || active.id === over.id) {
              return;
            }
            const oldIndex = lessonIds.indexOf(String(active.id));
            const newIndex = lessonIds.indexOf(String(over.id));
            handleReorder(oldIndex, newIndex).catch(console.error);
          }}
        >
          <SortableContext
            items={lessonIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-border divide-y">
              {lessonList.map((l) => (
                <LessonRow
                  key={String(l.id)}
                  lesson={l}
                  onDelete={() => onDeleteLesson(l.id as Id<"lessons">)}
                  onTogglePublish={() =>
                    onTogglePublish({
                      id: l.id as Id<"lessons">,
                      isPublished: !l.isPublished,
                    })
                  }
                  onUpdateEmbed={(raw) =>
                    onUpdateEmbed(l.id as Id<"lessons">, raw)
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
