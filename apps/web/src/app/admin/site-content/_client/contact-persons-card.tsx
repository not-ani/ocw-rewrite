"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@ocw/backend/convex/_generated/api";
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
	contactPersonFormSchema,
	type ContactPersonFormValues,
} from "@ocw/validators";
import type { PersonContact } from "./types";

type ContactPersonsCardProps = {
	school: string;
	contacts: PersonContact[];
};

export function ContactPersonsCard({
	school,
	contacts,
}: ContactPersonsCardProps) {
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [editingContact, setEditingContact] = useState<PersonContact | null>(
		null,
	);
	const [isAddingNew, setIsAddingNew] = useState(false);

	const updatePersonsContact = useMutation(api.site.updatePersonsContact);

	const newContactForm = useForm<ContactPersonFormValues>({
		resolver: zodResolver(contactPersonFormSchema),
		defaultValues: {
			name: "",
			email: "",
			description: "",
		},
	});

	const handleStartEdit = (index: number) => {
		setEditingIndex(index);
		setEditingContact({ ...contacts[index] });
	};

	const handleCancelEdit = () => {
		setEditingIndex(null);
		setEditingContact(null);
	};

	const handleSaveEdit = async () => {
		if (editingIndex === null || !editingContact) return;

		try {
			const updated = [...contacts];
			updated[editingIndex] = editingContact;
			await updatePersonsContact({ school, personsContact: updated });
			toast.success("Contact updated successfully");
			setEditingIndex(null);
			setEditingContact(null);
		} catch (error) {
			toast.error("Failed to update contact");
			console.error(error);
		}
	};

	const handleUpdateEditingContact = (
		field: keyof PersonContact,
		value: string,
	) => {
		if (!editingContact) return;
		setEditingContact({ ...editingContact, [field]: value });
	};

	const handleAddContact = () => {
		setIsAddingNew(true);
		newContactForm.reset();
	};

	const handleSaveNewContact = async (values: ContactPersonFormValues) => {
		try {
			await updatePersonsContact({
				school,
				personsContact: [
					...contacts,
					{
						name: values.name,
						email: values.email,
						description: values.description || "",
					},
				],
			});
			toast.success("Contact added successfully");
			setIsAddingNew(false);
			newContactForm.reset();
		} catch (error) {
			toast.error("Failed to add contact");
			console.error(error);
		}
	};

	const handleCancelNew = () => {
		setIsAddingNew(false);
		newContactForm.reset();
	};

	const handleDeleteContact = async (index: number) => {
		try {
			const updated = contacts.filter((_, i) => i !== index);
			await updatePersonsContact({ school, personsContact: updated });
			toast.success("Contact deleted successfully");
		} catch (error) {
			toast.error("Failed to delete contact");
			console.error(error);
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Contact Persons</CardTitle>
						<CardDescription>
							Manage contact persons for the site
						</CardDescription>
					</div>
					<Button onClick={handleAddContact} size="sm">
						<Plus className="mr-2 h-4 w-4" />
						Add Contact
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Description</TableHead>
							<TableHead className="w-[100px]">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{contacts.map((contact, index) => (
							<TableRow key={index}>
								<TableCell>
									{editingIndex === index && editingContact ? (
										<Input
											value={editingContact.name}
											onChange={(e) =>
												handleUpdateEditingContact("name", e.target.value)
											}
										/>
									) : (
										contact.name
									)}
								</TableCell>
								<TableCell>
									{editingIndex === index && editingContact ? (
										<Input
											type="email"
											value={editingContact.email}
											onChange={(e) =>
												handleUpdateEditingContact("email", e.target.value)
											}
										/>
									) : (
										contact.email
									)}
								</TableCell>
								<TableCell>
									{editingIndex === index && editingContact ? (
										<Textarea
											value={editingContact.description}
											onChange={(e) =>
												handleUpdateEditingContact(
													"description",
													e.target.value,
												)
											}
											rows={2}
										/>
									) : (
										<span className="text-sm">{contact.description}</span>
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
													onClick={() => handleDeleteContact(index)}
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
										{...newContactForm.register("name")}
										placeholder="Name"
									/>
									{newContactForm.formState.errors.name && (
										<p className="mt-1 text-destructive text-xs">
											{newContactForm.formState.errors.name.message}
										</p>
									)}
								</TableCell>
								<TableCell>
									<Input
										type="email"
										{...newContactForm.register("email")}
										placeholder="Email"
									/>
									{newContactForm.formState.errors.email && (
										<p className="mt-1 text-destructive text-xs">
											{newContactForm.formState.errors.email.message}
										</p>
									)}
								</TableCell>
								<TableCell>
									<Textarea
										{...newContactForm.register("description")}
										placeholder="Description"
										rows={2}
									/>
								</TableCell>
								<TableCell>
									<div className="flex gap-2">
										<Button
											size="icon"
											variant="ghost"
											onClick={newContactForm.handleSubmit(
												handleSaveNewContact,
											)}
											disabled={newContactForm.formState.isSubmitting}
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
