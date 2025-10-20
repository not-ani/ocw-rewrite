"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X, Check } from "lucide-react";
import type { PersonContact } from "./types";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Must be a valid email address"),
  description: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

type ContactPersonsCardProps = {
  school: string;
  contacts: PersonContact[];
};

export function ContactPersonsCard({
  school,
  contacts,
}: ContactPersonsCardProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingContact, setEditingContact] = useState<PersonContact | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  const updatePersonsContact = useMutation(api.site.updatePersonsContact);

  const newContactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
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

  const handleUpdateEditingContact = (field: keyof PersonContact, value: string) => {
    if (!editingContact) return;
    setEditingContact({ ...editingContact, [field]: value });
  };

  const handleAddContact = () => {
    setIsAddingNew(true);
    newContactForm.reset();
  };

  const handleSaveNewContact = async (values: ContactFormValues) => {
    try {
      await updatePersonsContact({ 
        school, 
        personsContact: [
          ...contacts,
          {
            name: values.name,
            email: values.email,
            description: values.description || "",
          }
        ]
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
            <Plus className="h-4 w-4 mr-2" />
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
                        handleUpdateEditingContact("description", e.target.value)
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
                    <p className="text-xs text-destructive mt-1">
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
                    <p className="text-xs text-destructive mt-1">
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
                      onClick={newContactForm.handleSubmit(handleSaveNewContact)}
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

