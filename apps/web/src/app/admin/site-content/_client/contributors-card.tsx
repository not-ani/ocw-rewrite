"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { Contributor } from "./types";

const contributorSchema = z.object({
	name: z.string().min(1, "Name is required"),
	role: z.string().min(1, "Role is required"),
	avatar: z.url("Must be a valid URL").optional().or(z.literal("")),
	description: z.string().optional(),
});

type ContributorFormValues = z.infer<typeof contributorSchema>;

type ContributorsCardProps = {
	school: string;
	contributors: Contributor[];
};

export function ContributorsCard({
	school,
	contributors,
}: ContributorsCardProps) {
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [editingContributor, setEditingContributor] =
		useState<Contributor | null>(null);
	const [isAddingNew, setIsAddingNew] = useState(false);

	const updateContributors = useMutation(api.site.updateContributors);

	const newContributorForm = useForm<ContributorFormValues>({
		resolver: zodResolver(contributorSchema),
		defaultValues: {
			name: "",
			role: "",
			avatar: "",
			description: "",
		},
	});

	const handleStartEdit = (index: number) => {
		setEditingIndex(index);
		setEditingContributor({ ...contributors[index] });
	};

	const handleCancelEdit = () => {
		setEditingIndex(null);
		setEditingContributor(null);
	};

	const handleSaveEdit = async () => {
		if (editingIndex === null || !editingContributor) return;

		try {
			const updated = [...contributors];
			updated[editingIndex] = editingContributor;
			await updateContributors({ school, contributors: updated });
			toast.success("Contributor updated successfully");
			setEditingIndex(null);
			setEditingContributor(null);
		} catch (error) {
			toast.error("Failed to update contributor");
			console.error(error);
		}
	};

	const handleUpdateEditingContributor = (
		field: keyof Contributor,
		value: string,
	) => {
		if (!editingContributor) return;
		setEditingContributor({ ...editingContributor, [field]: value });
	};

	const handleAddContributor = () => {
		setIsAddingNew(true);
		newContributorForm.reset();
	};

	const handleSaveNewContributor = async (values: ContributorFormValues) => {
		try {
			await updateContributors({
				school,
				contributors: [
					...contributors,
					{
						name: values.name,
						role: values.role,
						avatar: values.avatar || "",
						description: values.description || "",
					},
				],
			});
			toast.success("Contributor added successfully");
			setIsAddingNew(false);
			newContributorForm.reset();
		} catch (error) {
			toast.error("Failed to add contributor");
			console.error(error);
		}
	};

	const handleCancelNew = () => {
		setIsAddingNew(false);
		newContributorForm.reset();
	};

	const handleDeleteContributor = async (index: number) => {
		try {
			const updated = contributors.filter((_, i) => i !== index);
			await updateContributors({ school, contributors: updated });
			toast.success("Contributor deleted successfully");
		} catch (error) {
			toast.error("Failed to delete contributor");
			console.error(error);
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Contributors</CardTitle>
						<CardDescription>
							Manage site contributors and their information
						</CardDescription>
					</div>
					<Button onClick={handleAddContributor} size="sm">
						<Plus className="mr-2 h-4 w-4" />
						Add Contributor
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Avatar URL</TableHead>
							<TableHead>Description</TableHead>
							<TableHead className="w-[100px]">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{contributors.map((contributor, index) => (
							<TableRow key={index}>
								<TableCell>
									{editingIndex === index && editingContributor ? (
										<Input
											value={editingContributor.name}
											onChange={(e) =>
												handleUpdateEditingContributor("name", e.target.value)
											}
										/>
									) : (
										contributor.name
									)}
								</TableCell>
								<TableCell>
									{editingIndex === index && editingContributor ? (
										<Input
											value={editingContributor.role}
											onChange={(e) =>
												handleUpdateEditingContributor("role", e.target.value)
											}
										/>
									) : (
										contributor.role
									)}
								</TableCell>
								<TableCell>
									{editingIndex === index && editingContributor ? (
										<Input
											value={editingContributor.avatar}
											onChange={(e) =>
												handleUpdateEditingContributor("avatar", e.target.value)
											}
										/>
									) : (
										<span className="block max-w-[200px] truncate text-xs">
											{contributor.avatar}
										</span>
									)}
								</TableCell>
								<TableCell>
									{editingIndex === index && editingContributor ? (
										<Textarea
											value={editingContributor.description}
											onChange={(e) =>
												handleUpdateEditingContributor(
													"description",
													e.target.value,
												)
											}
											rows={2}
										/>
									) : (
										<span className="text-sm">{contributor.description}</span>
									)}
								</TableCell>
								<TableCell>
									<div className="flex gap-2">
										{editingIndex === index ? (
											<>
												<Button
													size="icon"
													variant="ghost"
													onClick={handleSaveEdit}
												>
													<Check className="h-4 w-4" />
												</Button>
												<Button
													size="icon"
													variant="ghost"
													onClick={handleCancelEdit}
												>
													<X className="h-4 w-4" />
												</Button>
											</>
										) : (
											<>
												<Button
													size="icon"
													variant="ghost"
													onClick={() => handleStartEdit(index)}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													size="icon"
													variant="ghost"
													onClick={() => handleDeleteContributor(index)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</>
										)}
									</div>
								</TableCell>
							</TableRow>
						))}
						{isAddingNew && (
							<TableRow>
								<TableCell>
									<Input
										{...newContributorForm.register("name")}
										placeholder="Name"
									/>
									{newContributorForm.formState.errors.name && (
										<p className="mt-1 text-destructive text-xs">
											{newContributorForm.formState.errors.name.message}
										</p>
									)}
								</TableCell>
								<TableCell>
									<Input
										{...newContributorForm.register("role")}
										placeholder="Role"
									/>
									{newContributorForm.formState.errors.role && (
										<p className="mt-1 text-destructive text-xs">
											{newContributorForm.formState.errors.role.message}
										</p>
									)}
								</TableCell>
								<TableCell>
									<Input
										{...newContributorForm.register("avatar")}
										placeholder="Avatar URL"
									/>
									{newContributorForm.formState.errors.avatar && (
										<p className="mt-1 text-destructive text-xs">
											{newContributorForm.formState.errors.avatar.message}
										</p>
									)}
								</TableCell>
								<TableCell>
									<Textarea
										{...newContributorForm.register("description")}
										placeholder="Description"
										rows={2}
									/>
								</TableCell>
								<TableCell>
									<div className="flex gap-2">
										<Button
											size="icon"
											variant="ghost"
											onClick={newContributorForm.handleSubmit(
												handleSaveNewContributor,
											)}
											disabled={newContributorForm.formState.isSubmitting}
										>
											<Check className="h-4 w-4" />
										</Button>
										<Button
											size="icon"
											variant="ghost"
											onClick={handleCancelNew}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
