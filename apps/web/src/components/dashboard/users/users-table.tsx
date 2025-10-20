"use client";

import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableHeader,
  TableHeaderGroup,
  TableProvider,
  TableRow,
  type ColumnDef,
} from "@/components/ui/kibo-ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ClerkUser = {
  id: string;
  clerkId: string;
  email: string;
  fullName: string;
  imageUrl: string;
};

type CourseMember = {
  id: Id<"courseUsers">;
  userId: string;
  role: "admin" | "editor" | "user";
  permissions: string[];
};

type UserWithMembership = {
  clerkUser: ClerkUser;
  membership: CourseMember;
};

type UsersTableProps = {
  courseId: Id<"courses">;
  users: UserWithMembership[];
  canEdit: boolean;
};

function RoleSelect({
  courseId,
  userId,
  currentRole,
  disabled,
}: {
  courseId: Id<"courses">;
  userId: string;
  currentRole: "admin" | "editor" | "user";
  disabled?: boolean;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const updateMember = useMutation(api.courseUsers.addOrUpdateMember);

  const handleRoleChange = async (newRole: "admin" | "editor" | "user") => {
    if (newRole === currentRole) return;

    setIsUpdating(true);
    try {
      await updateMember({
        courseId,
        userId,
        role: newRole,
      });
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update role",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      value={currentRole}
      onValueChange={handleRoleChange}
      disabled={disabled || isUpdating}
    >
      <SelectTrigger className="w-[110px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="user">User</SelectItem>
        <SelectItem value="editor">Editor</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
      </SelectContent>
    </Select>
  );
}

function RemoveUserButton({
  courseId,
  userId,
  userName,
}: {
  courseId: Id<"courses">;
  userId: string;
  userName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const removeMember = useMutation(api.courseUsers.removeMember);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeMember({ courseId, userId });
      toast.success("User removed from course");
      setIsOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove user",
      );
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove from course
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{userName}</strong> from
              this course? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function getRoleBadgeVariant(
  role: string,
): "default" | "secondary" | "destructive" {
  switch (role) {
    case "admin":
      return "destructive";
    case "editor":
      return "default";
    default:
      return "secondary";
  }
}

export function UsersTable({ courseId, users, canEdit }: UsersTableProps) {
  const columns: ColumnDef<UserWithMembership>[] = [
    {
      accessorKey: "user",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="User" />
      ),
      cell: ({ row }) => {
        const user = row.original.clerkUser;
        const initials = user.fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.imageUrl} alt={user.fullName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.fullName}</div>
              <div className="text-muted-foreground text-sm">{user.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const role = row.original.membership.role;
        if (!canEdit) {
          return (
            <Badge variant={getRoleBadgeVariant(role)}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
          );
        }
        return (
          <RoleSelect
            courseId={courseId}
            userId={row.original.membership.userId}
            currentRole={role}
          />
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Status" />
      ),
      cell: () => <Badge variant="outline">Active</Badge>,
    },
    {
      id: "actions",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row }) => {
        if (!canEdit) return null;
        return (
          <div className="flex justify-end">
            <RemoveUserButton
              courseId={courseId}
              userId={row.original.membership.userId}
              userName={row.original.clerkUser.fullName}
            />
          </div>
        );
      },
    },
  ];

  return (
    <TableProvider columns={columns} data={users} className="rounded-lg border">
      <TableHeader>
        {({ headerGroup }) => (
          <TableHeaderGroup headerGroup={headerGroup}>
            {({ header }) => <TableHead header={header} />}
          </TableHeaderGroup>
        )}
      </TableHeader>
      <TableBody>
        {({ row }) => (
          <TableRow row={row}>
            {({ cell }) => <TableCell cell={cell} />}
          </TableRow>
        )}
      </TableBody>
    </TableProvider>
  );
}
