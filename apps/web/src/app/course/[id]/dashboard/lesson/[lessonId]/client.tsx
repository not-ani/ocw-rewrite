"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import type { Preloaded } from "convex/react";
import { useMutation, usePreloadedQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useSite } from "@/lib/multi-tenant/context";

const lessonFormSchema = z.object({
	name: z.string().min(1, "Lesson name is required").max(200),
	isPublished: z.boolean(),
	contentType: z.enum([
		"google_docs",
		"notion",
		"quizlet",
		"google_drive",
		"other",
	]),
	embedUrl: z.string(),
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
	school,
}: {
	lesson: FunctionReturnType<typeof api.lesson.getLessonById>["lesson"];
	embed: FunctionReturnType<typeof api.lesson.getLessonById>["embed"];
	courseId: Id<"courses">;
	lessonId: Id<"lessons">;
	school: string;
}) {
	const router = useRouter();
	const updateLesson = useMutation(api.lesson.update);
	const createOrUpdateEmbed = useMutation(api.lesson.createOrUpdateEmbed);

	const form = useForm<LessonFormValues>({
		resolver: zodResolver(lessonFormSchema),
		defaultValues: {
			name: lesson.name,
			isPublished: lesson.isPublished,
			contentType: lesson.contentType,
			embedUrl: embed?.embedUrl || "",
		},
	});

	const canSubmit = form.formState.isValid;

	if (!lesson) {
		return (
			<div className="rounded-lg border p-6">
				<p className="text-muted-foreground">Lesson not found</p>
			</div>
		);
	}

	const onSubmit = async (values: LessonFormValues) => {
		try {
			await updateLesson({
				courseId,
				school,
				data: {
					id: lessonId,
					name: values.name,
					contentType: values.contentType,
					isPublished: values.isPublished,
				},
			});

			if (values.embedUrl?.trim()) {
				await createOrUpdateEmbed({
					lessonId,
					school,
					raw: values.embedUrl,
				});
			}

			toast.success("Lesson updated successfully");
		} catch (error) {
			toast.error("Failed to update lesson");
			console.error("Failed to update lesson", error);
		}
	};

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
							onClick={() =>
								router.push(
									`/course/${courseId}/dashboard/unit/${lesson.unitId}?school=${school}`,
								)
							}
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
											<SelectItem value="google_drive">
												Google Drive (PDF)
											</SelectItem>
											<SelectItem value="notion">Notion</SelectItem>
											<SelectItem value="quizlet">Quizlet</SelectItem>
											<SelectItem value="other">Other</SelectItem>
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
											ref={field.ref}
											name={field.name}
											type="checkbox"
											checked={field.value}
											onChange={(event) => field.onChange(event.target.checked)}
											onBlur={field.onBlur}
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
						<Button type="submit">
							<Save className="mr-2 h-4 w-4" />
							Save Changes
						</Button>
						<Button
							type="button"
							disabled={canSubmit === false}
							variant="outline"
							onClick={() =>
								router.push(
									`/course/${courseId}/${lesson.unitId}/${lessonId}?school=${school}`,
								)
							}
						>
							Preview Lesson
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
}

import { memo } from "react";

type LessonPageClientProps = {
	courseId: Id<"courses">;
	lessonId: Id<"lessons">;
	preloadedLesson: Preloaded<typeof api.lesson.getLessonById>;
};

export const LessonPageClient = memo(function LessonPageClient({
	courseId,
	lessonId,
	preloadedLesson,
}: LessonPageClientProps) {
	const router = useRouter();
	const data = usePreloadedQuery(preloadedLesson);
	const lesson = data?.lesson;
	const embed = data?.embed;
	const school = useSite().subdomain;

	return (
		<div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
			<div className="mb-6 flex items-center gap-3">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => {
						if (lesson?.unitId) {
							router.push(
								`/course/${courseId}/dashboard/unit/${lesson.unitId}?school=${school}`,
							);
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
					school={school}
				/>
			</Suspense>
		</div>
	);
});
