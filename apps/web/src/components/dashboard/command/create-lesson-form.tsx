"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { FileText, Link2, Loader2Icon, XIcon } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@ocw/ui/button";
import { Checkbox } from "@ocw/ui/checkbox";
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
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxGroup,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxTrigger,
} from "@ocw/ui/kibo-ui/combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ocw/ui/tabs";
import { Textarea } from "@ocw/ui/textarea";
import { useSite } from "@/lib/multi-tenant/context";
import { UploadDropzone } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";

const formSchema = z.object({
	name: z.string().min(3, "Lesson name must be at least 3 characters").max(200),
	unitId: z.string().min(1, "Please select a unit"),
	embedRaw: z.string().optional(),
	pdfUrl: z.string().optional(),
	pdfName: z.string().optional(),
	pureLink: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateLessonInlineFormProps {
	courseId: Id<"courses">;
	onSuccess: () => void;
	onCancel: () => void;
}

export function CreateLessonInlineForm({
	courseId,
	onSuccess,
	onCancel,
}: CreateLessonInlineFormProps) {
	const createLesson = useMutation(api.lesson.create);
	const { subdomain } = useSite();

	const units = useQuery(api.units.getTableData, {
		courseId,
		school: subdomain,
	});

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			unitId: "",
			embedRaw: "",
			pdfUrl: "",
			pdfName: "",
			pureLink: false,
		},
	});

	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [contentType, setContentType] = React.useState<"embed" | "pdf">(
		"embed",
	);

	const pdfUrl = form.watch("pdfUrl");
	const pdfName = form.watch("pdfName");

	const unitOptions = React.useMemo(() => {
		if (!units) return [];
		return units.map((unit) => ({
			label: unit.name,
			value: unit.id,
		}));
	}, [units]);

	async function onSubmit(values: FormValues) {
		setIsSubmitting(true);
		try {
			if (contentType === "pdf" && values.pdfUrl) {
				await createLesson({
					courseId,
					unitId: values.unitId as Id<"units">,
					name: values.name,
					pdfUrl: values.pdfUrl,
					pureLink: values.pureLink,
					school: subdomain,
				});
			} else {
				await createLesson({
					courseId,
					unitId: values.unitId as Id<"units">,
					name: values.name,
					embedRaw: values.embedRaw,
					pureLink: values.pureLink,
					school: subdomain,
				});
			}
			toast.success("Lesson created successfully!");
			onSuccess();
		} catch (error) {
			toast.error("Failed to create lesson. Please try again.");
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	}

	function clearPdf() {
		form.setValue("pdfUrl", "");
		form.setValue("pdfName", "");
	}

	const isLoading = units === undefined;

	return (
		<div className="p-4">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="font-semibold text-lg">Create New Lesson</h3>
				<Button
					variant="ghost"
					size="icon"
					onClick={onCancel}
					className="h-8 w-8"
				>
					<XIcon className="h-4 w-4" />
				</Button>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-8">
					<Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
				</div>
			) : (
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Lesson Name *</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g., Variables and Data Types"
											{...field}
											autoFocus
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="unitId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Unit *</FormLabel>
									<FormControl>
										<Combobox
											data={unitOptions}
											type="unit"
											value={field.value}
											onValueChange={field.onChange}
										>
											<ComboboxTrigger className="w-full" />
											<ComboboxContent>
												<ComboboxInput />
												<ComboboxList>
													<ComboboxEmpty />
													<ComboboxGroup>
														{unitOptions.map((option) => (
															<ComboboxItem
																key={option.value}
																value={option.value}
															>
																{option.label}
															</ComboboxItem>
														))}
													</ComboboxGroup>
												</ComboboxList>
											</ComboboxContent>
										</Combobox>
									</FormControl>
									<FormDescription>
										Select which unit this lesson belongs to
									</FormDescription>
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
								<TabsTrigger value="embed" className="gap-2 text-xs">
									<Link2 className="h-3 w-3" />
									Embed URL
								</TabsTrigger>
								<TabsTrigger value="pdf" className="gap-2 text-xs">
									<FileText className="h-3 w-3" />
									PDF Upload
								</TabsTrigger>
							</TabsList>

							<TabsContent value="embed" className="mt-3">
								<FormField
									control={form.control}
									name="embedRaw"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Embed URL or iFrame (Optional)</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Paste embed URL or iframe code..."
													className="resize-none font-mono text-xs"
													rows={3}
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
							</TabsContent>

							<TabsContent value="pdf" className="mt-3">
								<FormItem>
									<FormLabel>PDF File</FormLabel>
									{pdfUrl ? (
										<div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
											<FileText className="h-6 w-6 text-primary" />
											<div className="min-w-0 flex-1">
												<p className="truncate font-medium text-xs">
													{pdfName || "PDF uploaded"}
												</p>
												<p className="text-muted-foreground text-xs">
													Ready to create
												</p>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={clearPdf}
												className="h-6 w-6 shrink-0"
											>
												<XIcon className="h-3 w-3" />
											</Button>
										</div>
									) : (
										<UploadDropzone
											endpoint="pdfUploader"
											onClientUploadComplete={(res) => {
												if (res?.[0]) {
													form.setValue("pdfUrl", res[0].ufsUrl);
													form.setValue("pdfName", res[0].name);
													toast.success("PDF uploaded");
												}
											}}
											onUploadError={(error: Error) => {
												toast.error(`Upload failed: ${error.message}`);
											}}
											className={cn(
												"cursor-pointer rounded-lg border-2 border-dashed p-4 transition-colors",
												"hover:border-primary/50 hover:bg-muted/50",
												"ut-uploading:border-primary ut-uploading:bg-primary/5",
											)}
											content={{
												label: "Drop PDF or click",
												allowedContent: "PDF up to 16MB",
											}}
										/>
									)}
									<FormDescription>
										Upload a PDF file (max 16MB)
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

						<div className="flex gap-2 pt-2">
							<Button type="submit" disabled={isSubmitting} className="flex-1">
								{isSubmitting ? (
									<>
										<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
										Creating...
									</>
								) : (
									"Create Lesson"
								)}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={onCancel}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
						</div>
					</form>
				</Form>
			)}
		</div>
	);
}
