"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@ocw/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { Loader2Icon, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@ocw/ui/button";
import { Checkbox } from "@ocw/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@ocw/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@ocw/ui/form";
import { Input } from "@ocw/ui/input";
import { Textarea } from "@ocw/ui/textarea";
import { useSite } from "@/lib/multi-tenant/context";

const formSchema = z.object({
	name: z
		.string()
		.min(3, "Course name must be at least 3 characters")
		.max(100, "Course name must be less than 100 characters"),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters")
		.max(500, "Description must be less than 500 characters"),
	subjectId: z.string().min(1, "Subject ID is required"),
	isPublic: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export function AddCourseDialog() {
	const [open, setOpen] = useState(false);
	const { subdomain } = useSite();
	const createCourse = useMutation(api.admin.createCourse);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			subjectId: "",
			isPublic: false,
		},
	});

	const [isSubmitting, setIsSubmitting] = useState(false);

	async function onSubmit(values: FormValues) {
		setIsSubmitting(true);
		try {
			await createCourse({
				name: values.name,
				description: values.description,
				subjectId: values.subjectId,
				isPublic: values.isPublic,
				school: subdomain,
			});
			toast.success("Course created successfully!");
			setOpen(false);
			form.reset();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create course",
			);
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Add Course
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Create New Course</DialogTitle>
					<DialogDescription>
						Add a new course to the platform. Fill in the details below.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Course Name *</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g., Introduction to Computer Science"
											{...field}
										/>
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
									<FormLabel>Description *</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Brief description of the course..."
											className="resize-none"
											rows={4}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="subjectId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Course Subject *</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g. Computer Science, Science, Social Studies, etc."
											{...field}
										/>
									</FormControl>
									<FormDescription>
										A unique identifier for this course (e.g. Computer Science,
										Science, Social Studies, etc.)
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="isPublic"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>Publish course immediately</FormLabel>
										<FormDescription>
											Make this course visible to all users
										</FormDescription>
									</div>
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setOpen(false);
									form.reset();
								}}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
										Creating...
									</>
								) : (
									"Create Course"
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
