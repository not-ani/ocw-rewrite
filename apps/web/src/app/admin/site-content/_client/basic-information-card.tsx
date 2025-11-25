"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@ocw/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@/lib/uploadthing";

const basicInfoSchema = z.object({
	schoolName: z.string().min(1, "School name is required"),
	siteHero: z.string().optional(),
	siteLogo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
	siteContributeLink: z
		.string()
		.url("Must be a valid URL")
		.optional()
		.or(z.literal("")),
	instagramUrl: z
		.string()
		.url("Must be a valid URL")
		.optional()
		.or(z.literal("")),
});

type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

type BasicInformationCardProps = {
	school: string;
	schoolName: string;
	siteHero: string;
	siteLogo: string;
	siteContributeLink: string;
	instagramUrl: string;
};

export function BasicInformationCard({
	school,
	schoolName,
	siteHero,
	siteLogo,
	siteContributeLink,
	instagramUrl,
}: BasicInformationCardProps) {
	const updateBasicFields = useMutation(api.site.updateSiteConfigBasicFields);
	const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string>(
		siteLogo || "",
	);

	const form = useForm<BasicInfoFormValues>({
		resolver: zodResolver(basicInfoSchema),
		defaultValues: {
			schoolName: schoolName || "",
			siteHero: siteHero || "",
			siteLogo: siteLogo || "",
			siteContributeLink: siteContributeLink || "",
			instagramUrl: instagramUrl || "",
		},
	});

	const onSubmit = async (values: BasicInfoFormValues) => {
		try {
			await updateBasicFields({
				school,
				schoolName: values.schoolName,
				siteHero: values.siteHero || undefined,
				siteLogo: values.siteLogo || undefined,
				siteContributeLink: values.siteContributeLink || undefined,
				instagramUrl: values.instagramUrl || undefined,
			});
			toast.success("Basic information updated successfully");
		} catch (error) {
			toast.error("Failed to update basic information");
			console.error(error);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Basic Information</CardTitle>
				<CardDescription>
					Update basic site information and branding
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="schoolName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>School Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter school name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="siteHero"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Site Hero Text</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter hero text for the homepage"
											rows={3}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="siteLogo"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Site Logo</FormLabel>
									<FormControl>
										<div className="space-y-4">
											{/* Preview of current logo */}
											{(uploadedLogoUrl || field.value) && (
												<div className="relative inline-block">
													<Image
														src={(uploadedLogoUrl || field.value) as string}
														alt="Site logo preview"
														width={96}
														height={96}
														className="h-24 w-24 rounded-md border border-gray-300 object-contain"
													/>
													<button
														type="button"
														onClick={() => {
															setUploadedLogoUrl("");
															field.onChange("");
														}}
														className="-top-2 -right-2 absolute rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
													>
														<X className="h-4 w-4" />
													</button>
												</div>
											)}

											{/* Upload Button */}
											<UploadButton
												endpoint="imageUploader"
												onClientUploadComplete={(res) => {
													// Do something with the response
													if (res?.[0]) {
														const url = res[0].url;
														setUploadedLogoUrl(url);
														field.onChange(url);
														toast.success("Logo uploaded successfully!");
													}
												}}
												onUploadError={(error: Error) => {
													toast.error(`Upload failed: ${error.message}`);
												}}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="siteContributeLink"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Contribute Link</FormLabel>
									<FormControl>
										<Input
											placeholder="https://example.com/contribute"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="instagramUrl"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Instagram URL</FormLabel>
									<FormControl>
										<Input
											placeholder="https://www.instagram.com/example/"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button
							type="submit"
							disabled={form.formState.isSubmitting}
							className="w-full"
						>
							{form.formState.isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								"Save Basic Information"
							)}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
