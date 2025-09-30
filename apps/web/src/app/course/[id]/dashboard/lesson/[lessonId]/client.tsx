"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import type { Preloaded } from "convex/react";
import { useMutation, usePreloadedQuery } from "convex/react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const lessonFormSchema = z.object({
  name: z.string().min(1, "Lesson name is required").max(200),
  isPublished: z.boolean(),
  contentType: z.enum(["google_docs", "notion", "quizlet", "tiptap", "flashcard"]),
  embedUrl: z.string().optional(),
});

type LessonFormValues = z.infer<typeof lessonFormSchema>;

function LessonFormSkeleton() {
  return (
    <div className="space-y-6 rounded-lg border p-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-5 w-48" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

function LessonEditForm({
  lesson,
  embed,
  courseId,
  lessonId,
}: {
  lesson: {
    _id?: Id<"lessons">;
    name?: string;
    isPublished?: boolean;
    contentType?: "google_docs" | "notion" | "quizlet" | "tiptap" | "flashcard";
    courseId?: Id<"courses">;
    unitId?: Id<"units">;
    order?: number;
    pureLink?: boolean;
    content?: unknown;
  } | null | undefined;
  embed: {
    _id?: Id<"lessonEmbeds">;
    embedUrl?: string;
    password?: string;
    lessonId?: Id<"lessons">;
  } | null | undefined;
  courseId: Id<"courses">;
  lessonId: Id<"lessons">;
}) {
  const router = useRouter();
  const updateLesson = useMutation(api.lesson.update);
  const createOrUpdateEmbed = useMutation(api.lesson.createOrUpdateEmbed);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      name: lesson?.name ?? "",
      isPublished: lesson?.isPublished ?? false,
      contentType: lesson?.contentType ?? "tiptap",
      embedUrl: embed?.embedUrl ?? "",
    },
  });

  // Update form when lesson data changes
  useEffect(() => {
    if (lesson) {
      form.reset({
        name: lesson.name,
        isPublished: lesson.isPublished,
        contentType: lesson.contentType,
        embedUrl: embed?.embedUrl ?? "",
      });
    }
  }, [lesson, embed, form]);

  const onSubmit = async (values: LessonFormValues) => {
    setIsSubmitting(true);
    try {
      // Update lesson metadata
      await updateLesson({
        courseId,
        data: {
          id: lessonId,
          name: values.name,
          isPublished: values.isPublished,
        },
      });

      // Update embed URL if provided
      if (values.embedUrl && values.embedUrl.trim()) {
        await createOrUpdateEmbed({
          lessonId,
          raw: values.embedUrl,
        });
      }

      toast.success("Lesson updated successfully");
    } catch (error) {
      toast.error("Failed to update lesson");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lesson) {
    return (
      <div className="rounded-lg border p-6">
        <p className="text-muted-foreground">Lesson not found</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-lg">Lesson Settings</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push(`/course/${courseId}/dashboard/unit/${lesson.unitId}`)}
            >
              View Unit
            </Button>
          </div>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter lesson name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="google_docs">Google Docs</SelectItem>
                      <SelectItem value="notion">Notion</SelectItem>
                      <SelectItem value="quizlet">Quizlet</SelectItem>
                      <SelectItem value="tiptap">Rich Text Editor</SelectItem>
                      <SelectItem value="flashcard">Flashcards</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The type of content for this lesson
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="embedUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Embed URL or iFrame</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste embed URL or iframe code"
                      className="min-h-[80px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Paste the embed URL or full iframe code for external content
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
                      Make this lesson visible to students
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/course/${courseId}/${lesson.unitId}/${lessonId}`)}
            >
              Preview Lesson
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export function LessonPageClient({
  courseId,
  lessonId,
  preloadedLesson,
}: {
  courseId: Id<"courses">;
  lessonId: Id<"lessons">;
  preloadedLesson: Preloaded<typeof api.lesson.getLessonById>;
}) {
  const router = useRouter();
  const data = usePreloadedQuery(preloadedLesson);
  const lesson = data?.lesson;
  const embed = data?.embed;

  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (lesson?.unitId) {
              router.push(`/course/${courseId}/dashboard/unit/${lesson.unitId}`);
            } else {
              router.push(`/course/${courseId}/dashboard`);
            }
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Unit
        </Button>
      </div>

      <Suspense fallback={<LessonFormSkeleton />}>
        <LessonEditForm
          lesson={lesson}
          embed={embed}
          courseId={courseId}
          lessonId={lessonId}
        />
      </Suspense>
    </div>
  );
}
