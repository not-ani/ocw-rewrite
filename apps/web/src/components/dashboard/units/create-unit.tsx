"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@ocw/ui/button";
import { Checkbox } from "@ocw/ui/checkbox";
import { Dialog, DialogContent, DialogTrigger } from "@ocw/ui/dialog";
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
	unitName: z.string().min(1).min(3).max(50),
	description: z.string().optional(),
	isPublished: z.boolean().default(true).optional(),
});

type CreateUnitFormProps = {
	callback: () => void;
	courseId: Id<"courses">;
};

export function CreateUnitForm({ callback, courseId }: CreateUnitFormProps) {
	const { subdomain } = useSite();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	const mutate = useMutation(api.units.create);

	function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			callback();
			mutate({
				...values,
				courseId,
				school: subdomain,
			});
		} catch (_error) {
			toast.error("Failed to submit the form. Please try again.");
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
					name="unitName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Unit Name</FormLabel>
							<FormControl>
								<Input
									placeholder="Your unit's name here"
									type="text"
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
							<FormLabel>Description </FormLabel>
							<FormControl>
								<Textarea
									className="resize-none"
									placeholder="A brief description of your unit (optional)"
									{...field}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="isPublished"
					render={({ field }) => (
						<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
							<FormControl>
								<Checkbox
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
							<div className="space-y-1 leading-none">
								<FormLabel>Published</FormLabel>
								<FormDescription>
									Do you want your unit to be publicly viewable
								</FormDescription>
								<FormMessage />
							</div>
						</FormItem>
					)}
				/>
				<Button type="submit">Submit</Button>
			</form>
		</Form>
	);
}

export function CreateUnitDialog() {
	const [open, setOpen] = useState(false);
	const params = useParams<{ id: string }>();
	const id = params.id;

	if (!id) {
		// Handle missing ID - either redirect or show error
		return null;
	}

	function changeOpen() {
		setOpen(false);
	}

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button variant={"outline"}>Create Unit</Button>
			</DialogTrigger>
			<DialogContent>
				<CreateUnitForm callback={changeOpen} courseId={id as Id<"courses">} />
			</DialogContent>
		</Dialog>
	);
}
