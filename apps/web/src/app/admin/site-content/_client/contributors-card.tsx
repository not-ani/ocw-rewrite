"use client";

import { arktypeResolver } from "@hookform/resolvers/arktype";
import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@ocw/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@ocw/ui/card";
import { Input } from "@ocw/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@ocw/ui/table";
import { Textarea } from "@ocw/ui/textarea";
import {
	contributorFormSchema,
	type ContributorFormValues,
} from "@ocw/validators";

type Contributor = {
	_id: Id<"contributors">;
	school: string;
	name: string;
	role: string;
	avatar: string;
	description: string;
	order: number;
};

type ContributorsCardProps = {
	school: string;
	contributors: Contributor[];
};

export function ContributorsCard({
	school,
	contributors,
}: ContributorsCardProps) {
	const [editingId, setEditingId] = useState<Id<"contributors"> | null>(null);
	const [editingContributor, setEditingContributor] =
		useState<Contributor | null>(null);
	const [isAddingNew, setIsAddingNew] = useState(false);

	const createContributor = useMutation(api.site.createContributor);
	const updateContributor = useMutation(api.site.updateContributor);
	const deleteContributor = useMutation(api.site.deleteContributor);

	const newContributorForm = useForm<ContributorFormValues>({
		resolver: arktypeResolver(contributorFormSchema),
		defaultValues: {
			name: "",
			role: "",
			avatar: "",
			description: "",
		},
	});

	const handleStartEdit = (contributor: Contributor) => {
		setEditingId(contributor._id);
		setEditingContributor({ ...contributor });
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setEditingContributor(null);
	};

	const handleSaveEdit = async () => {
		if (editingId === null || !editingContributor) return;

		try {
			await updateContributor({
				contributorId: editingId,
				name: editingContributor.name,
				role: editingContributor.role,
				avatar: editingContributor.avatar,
				description: editingContributor.description,
			});
			toast.success("Contributor updated successfully");
			setEditingId(null);
			setEditingContributor(null);
		} catch (error) {
			toast.error("Failed to update contributor");
			console.error(error);
		}
	};

	const handleUpdateEditingContributor = (
		field: keyof Pick<Contributor, "name" | "role" | "avatar" | "description">,
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
			await createContributor({
				school,
				name: values.name,
				role: values.role,
				avatar: values.avatar || "",
				description: values.description || "",
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

	const handleDeleteContributor = async (contributorId: Id<"contributors">) => {
		try {
			await deleteContributor({ contributorId });
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
						{contributors.map((contributor) => (
							<TableRow key={contributor._id}>
								<TableCell>
									{editingId === contributor._id && editingContributor ? (
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
									{editingId === contributor._id && editingContributor ? (
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
									{editingId === contributor._id && editingContributor ? (
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
									{editingId === contributor._id && editingContributor ? (
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
										{editingId === contributor._id ? (
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
													onClick={() => handleStartEdit(contributor)}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													size="icon"
													variant="ghost"
													onClick={() => handleDeleteContributor(contributor._id)}
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
