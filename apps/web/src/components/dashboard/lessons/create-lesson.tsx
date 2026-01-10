"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { FileText, Link2, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@ocw/ui/button";
import { Checkbox } from "@ocw/ui/checkbox";
import {
	Dialog,
	DialogContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ocw/ui/tabs";
import { Textarea } from "@ocw/ui/textarea";
import { useSite } from "@/lib/multi-tenant/context";
import { UploadDropzone } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";

const formSchema = z.object({
	name: z.string().min(1, "Lesson name is required").min(3).max(200),
	embedRaw: z.string().optional(),
	pdfUrl: z.string().optional(),
	pdfName: z.string().optional(),
	pureLink: z.boolean().optional(),
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
			pdfUrl: "",
			pdfName: "",
			pureLink: false,
		},
	});

	const createLesson = useMutation(api.lesson.create);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [contentType, setContentType] = useState<"embed" | "pdf">("embed");
	const { subdomain } = useSite();

	const pdfUrl = form.watch("pdfUrl");
	const pdfName = form.watch("pdfName");

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsSubmitting(true);
		try {
			if (contentType === "pdf" && values.pdfUrl) {
				await createLesson({
					courseId,
					unitId,
					school: subdomain,
					name: values.name,
					pdfUrl: values.pdfUrl,
					pureLink: values.pureLink,
				});
			} else {
				await createLesson({
					courseId,
					unitId,
					school: subdomain,
					name: values.name,
					embedRaw: values.embedRaw,
					pureLink: values.pureLink,
				});
			}
			toast.success("Lesson created successfully");
			form.reset();
			setContentType("embed");
			callback();
		} catch (error) {
			toast.error("Failed to create lesson");
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	}

	function clearPdf() {
		form.setValue("pdfUrl", "");
		form.setValue("pdfName", "");
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

				<Tabs
					value={contentType}
					onValueChange={(v) => setContentType(v as "embed" | "pdf")}
					className="w-full"
				>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="embed" className="gap-2">
							<Link2 className="h-4 w-4" />
							Embed URL
						</TabsTrigger>
						<TabsTrigger value="pdf" className="gap-2">
							<FileText className="h-4 w-4" />
							PDF Upload
						</TabsTrigger>
					</TabsList>

					<TabsContent value="embed" className="mt-4">
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
										Supports Google Docs, YouTube, Quizlet, Notion, and more
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</TabsContent>

					<TabsContent value="pdf" className="mt-4">
						<FormItem>
							<FormLabel>PDF File</FormLabel>
							{pdfUrl ? (
								<div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
									<FileText className="h-8 w-8 text-primary" />
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-sm">
											{pdfName || "PDF uploaded"}
										</p>
										<p className="text-muted-foreground text-xs">
											Ready to create lesson
										</p>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={clearPdf}
										className="h-8 w-8 shrink-0"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							) : (
								<UploadDropzone
									endpoint="pdfUploader"
									onClientUploadComplete={(res) => {
										if (res?.[0]) {
											form.setValue("pdfUrl", res[0].ufsUrl);
											form.setValue("pdfName", res[0].name);
											toast.success("PDF uploaded successfully");
										}
									}}
									onUploadError={(error: Error) => {
										toast.error(`Upload failed: ${error.message}`);
									}}
									className={cn(
										"cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors",
										"hover:border-primary/50 hover:bg-muted/50",
										"ut-uploading:border-primary ut-uploading:bg-primary/5",
									)}
									content={{
										label: "Drop PDF here or click to browse",
										allowedContent: "PDF up to 16MB",
									}}
								/>
							)}
							<FormDescription>
								Upload a PDF file for this lesson (max 16MB)
							</FormDescription>
						</FormItem>
					</TabsContent>
				</Tabs>

				<FormField
					control={form.control}
					name="pureLink"
					render={({ field }) => (
						<FormItem className="flex flex-row items-start space-x-3 space-y-0">
							<FormControl>
								<Checkbox
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
							<div className="space-y-1 leading-none">
								<FormLabel>Pure Link</FormLabel>
								<FormDescription>
									Open lesson link in a new tab with no referrer
								</FormDescription>
							</div>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="isPublished"
					render={({ field }) => (
						<FormItem className="flex flex-row items-start space-x-3 space-y-0">
							<FormControl>
								<Checkbox
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
							<div className="space-y-1 leading-none">
								<FormLabel>Publish lesson</FormLabel>
								<FormDescription>
									Make this lesson visible to students
								</FormDescription>
							</div>
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Creating...
						</>
					) : (
						"Create Lesson"
					)}
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
			<DialogContent className="max-w-lg">
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
