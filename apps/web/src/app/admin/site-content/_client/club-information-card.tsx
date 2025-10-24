"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
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

const clubInfoSchema = z.object({
	clubName: z.string().min(1, "Club name is required"),
	clubEmail: z.email("Must be a valid email address"),
});

type ClubInfoFormValues = z.infer<typeof clubInfoSchema>;

type ClubInformationCardProps = {
	school: string;
	clubName: string;
	clubEmail: string;
};

export function ClubInformationCard({
	school,
	clubName,
	clubEmail,
}: ClubInformationCardProps) {
	const updateClubInfo = useMutation(api.site.updateClubInfo);

	const form = useForm<ClubInfoFormValues>({
		resolver: zodResolver(clubInfoSchema),
		defaultValues: {
			clubName: clubName || "",
			clubEmail: clubEmail || "",
		},
	});

	const onSubmit = async (values: ClubInfoFormValues) => {
		try {
			await updateClubInfo({
				school,
				clubName: values.clubName,
				clubEmail: values.clubEmail,
			});
			toast.success("Club information updated successfully");
		} catch (error) {
			toast.error("Failed to update club information");
			console.error(error);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Club Information</CardTitle>
				<CardDescription>Update club contact information</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="clubName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Club Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter club name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="clubEmail"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Club Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="club@example.com"
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
								"Save Club Information"
							)}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
