"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { useSite } from "@/lib/multi-tenant/context";

const formSchema = z.object({
	name: z.string().min(1, "Lesson name is required").min(3).max(200),
	embedRaw: z.string().optional(),
});

type CreateLessonFormProps = {
	callback: () => void;
	courseId: Id<"courses">;
	unitId: Id<"units">;
};

export function CreateLessonForm({
	callback,
	courseId,
	unitId,
}: CreateLessonFormProps) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			embedRaw: "",
		},
	});

	const createLesson = useMutation(api.lesson.create);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { subdomain } = useSite();
	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsSubmitting(true);
		try {
			await createLesson({
				courseId,
				unitId,
				school: subdomain,
				name: values.name,
				embedRaw: values.embedRaw,
			});
			toast.success("Lesson created successfully");
			form.reset();
			callback();
		} catch (error) {
			toast.error("Failed to create lesson");
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<Form {...form}>
			<form
				className="flex flex-col justify-evenly gap-4"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Lesson Name</FormLabel>
							<FormControl>
								<Input placeholder="Enter lesson name" type="text" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="embedRaw"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Embed URL or iFrame (Optional)</FormLabel>
							<FormControl>
								<Textarea
									className="min-h-[80px] resize-none font-mono text-sm"
									placeholder="Paste embed URL or iframe code (optional)"
									{...field}
								/>
							</FormControl>
							<FormDescription>
								You can add this later if you prefer
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Creating..." : "Create Lesson"}
				</Button>
			</form>
		</Form>
	);
}

export function CreateLessonDialog({
	courseId,
	unitId,
}: {
	courseId: Id<"courses">;
	unitId: Id<"units">;
}) {
	const [open, setOpen] = useState(false);

	function changeOpen() {
		setOpen(false);
	}

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button>Add Lesson</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Lesson</DialogTitle>
				</DialogHeader>
				<CreateLessonForm
					callback={changeOpen}
					courseId={courseId}
					unitId={unitId}
				/>
			</DialogContent>
		</Dialog>
	);
}
