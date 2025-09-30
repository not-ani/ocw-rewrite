"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import type { Preloaded } from "convex/react";
import { useMutation, usePreloadedQuery } from "convex/react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { LessonsTable } from "./lessons-table";
import { CreateLessonDialog } from "@/components/dashboard/lessons/create-lesson";

const unitFormSchema = z.object({
  name: z.string().min(1, "Unit name is required").max(200),
  description: z.string().max(1000).optional(),
  isPublished: z.boolean(),
});

type UnitFormValues = z.infer<typeof unitFormSchema>;

function UnitFormSkeleton() {
  return (
    <div className="space-y-6 rounded-lg border p-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-5 w-48" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

function LessonsTableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-48" />
      <div className="rounded-lg border">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-b p-4 last:border-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UnitEditForm({
  unit,
  courseId,
  unitId,
}: {
  unit: {
    _id: Id<"units">;
    name: string;
    description?: string;
    isPublished: boolean;
    order: number;
    courseId: Id<"courses">;
  } | null;
  courseId: Id<"courses">;
  unitId: Id<"units">;
}) {
  const updateUnit = useMutation(api.units.update);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      name: unit?.name ?? "",
      description: unit?.description ?? "",
      isPublished: unit?.isPublished ?? false,
    },
  });

  // Update form when unit data changes
  useEffect(() => {
    if (unit) {
      form.reset({
        name: unit.name,
        description: unit.description ?? "",
        isPublished: unit.isPublished,
      });
    }
  }, [unit, form]);

  const onSubmit = async (values: UnitFormValues) => {
    setIsSubmitting(true);
    try {
      await updateUnit({
        courseId,
        data: {
          id: unitId,
          name: values.name,
          description: values.description || null,
          isPublished: values.isPublished,
        },
      });
      toast.success("Unit updated successfully");
    } catch (error) {
      toast.error("Failed to update unit");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!unit) {
    return (
      <div className="rounded-lg border p-6">
        <p className="text-muted-foreground">Unit not found</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 font-semibold text-lg">Unit Settings</h2>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter unit name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter unit description (optional)"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description for the unit
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="mt-1 h-4 w-4 rounded border-gray-300"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Published</FormLabel>
                    <FormDescription>
                      Make this unit visible to students
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="mt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export function UnitPageClient({
  courseId,
  unitId,
  preloadedUnit,
  preloadedLessons,
}: {
  courseId: Id<"courses">;
  unitId: Id<"units">;
  preloadedUnit: Preloaded<typeof api.units.getById>;
  preloadedLessons: Preloaded<typeof api.lesson.getByUnit>;
}) {
  const router = useRouter();
  const unit = usePreloadedQuery(preloadedUnit);
  const lessons = usePreloadedQuery(preloadedLessons);

  const updateLesson = useMutation(api.lesson.update);
  const reorderLessons = useMutation(api.lesson.reorder);
  const removeLesson = useMutation(api.lesson.remove);

  const handleUpdateLesson = useCallback(
    async (payload: {
      id: Id<"lessons">;
      data: Partial<{ isPublished: boolean; name: string }>;
    }) => {
      await updateLesson({
        courseId,
        data: { id: payload.id, ...payload.data },
      });
    },
    [updateLesson, courseId]
  );

  const handleRemoveLesson = useCallback(
    async (id: Id<"lessons">) => {
      await removeLesson({ courseId, id });
      toast.success("Lesson deleted");
    },
    [removeLesson, courseId]
  );

  const handleReorderLessons = useCallback(
    async (data: { id: Id<"lessons">; position: number }[]) => {
      await reorderLessons({ courseId, unitId, data });
    },
    [reorderLessons, courseId, unitId]
  );

  const lessonList = lessons ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/course/${courseId}/dashboard`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="space-y-8">
        <Suspense fallback={<UnitFormSkeleton />}>
          <UnitEditForm unit={unit} courseId={courseId} unitId={unitId} />
        </Suspense>

        <div className="border-t pt-8">
          <Suspense fallback={<LessonsTableSkeleton />}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Lessons</h2>
                <CreateLessonDialog courseId={courseId} unitId={unitId} />
              </div>
              <LessonsTable
                courseId={courseId}
                unitId={unitId}
                lessons={lessonList}
                onUpdateLesson={handleUpdateLesson}
                onRemoveLesson={handleRemoveLesson}
                onReorder={handleReorderLessons}
              />
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
