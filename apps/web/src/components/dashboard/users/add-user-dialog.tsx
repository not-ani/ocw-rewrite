"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const addUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["admin", "editor", "user"]),
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

type ClerkUser = {
  id: string;
  clerkId: string;
  email: string;
  fullName: string;
  imageUrl: string;
};

type AddUserDialogProps = {
  courseId: Id<"courses">;
  availableUsers: ClerkUser[];
  existingUserIds: Set<string>;
};

export function AddUserDialog({
  courseId,
  availableUsers,
  existingUserIds,
}: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const addOrUpdateMember = useMutation(api.courseUsers.addOrUpdateMember);

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      userId: "",
      role: "user",
    },
  });

  const onSubmit = async (values: AddUserFormValues) => {
    try {
      const result = await addOrUpdateMember({
        courseId,
        userId: values.userId,
        role: values.role,
      });

      if (result?.created) {
        toast.success("User added successfully");
      } else if (result?.updated) {
        toast.success("User role updated");
      }

      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add user",
      );
    }
  };

  // Filter out users already in the course
  const availableUsersToAdd = availableUsers.filter(
    (user) => !existingUserIds.has(user.id),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add User to Course</DialogTitle>
          <DialogDescription>
            Add a user to this course and assign them a role.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-[100%]">
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableUsersToAdd.length === 0 ? (
                        <div className="text-muted-foreground p-2 text-center text-sm">
                          No users available to add
                        </div>
                      ) : (
                        availableUsersToAdd.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {user.fullName}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                ({user.email})
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the user you want to add to this course
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-[100%]">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    <div className="mt-1 space-y-1">
                      <div>
                        <strong>User:</strong> Can view published content
                      </div>
                      <div>
                        <strong>Editor:</strong> Can create and edit content
                      </div>
                      <div>
                        <strong>Admin:</strong> Full access to course management
                      </div>
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add User
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
