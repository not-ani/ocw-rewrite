"use client";

import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Doc } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import type { ColumnDef } from "@/components/ui/kibo-ui/table";
import {
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableHeader,
  TableHeaderGroup,
  TableProvider,
  TableRow,
} from "@/components/ui/kibo-ui/table";
import { useSite } from "@/lib/multi-tenant/context";

type SiteAdmin = Doc<"siteUser">;

type ClerkUser = {
  id: string;
  clerkId: string;
  email: string;
  fullName: string;
  imageUrl: string;
};

type AdminWithUser = {
  admin: SiteAdmin;
  clerkUser: ClerkUser | null;
};

type AdminsTableProps = {
  adminsWithUsers: AdminWithUser[];
};

function RemoveAdminButton({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const removeAdmin = useMutation(api.admin.removeSiteAdmin);
  const { subdomain } = useSite();
  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeAdmin({ userId, school: subdomain });
      toast.success("Admin removed successfully");
      setIsOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove admin",
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
            Remove admin
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Site Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{userName}</strong> as a
              site admin? They will lose all site-wide administrative
              privileges.
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

export function AdminsTable({ adminsWithUsers }: AdminsTableProps) {
  const columns: ColumnDef<AdminWithUser>[] = [
    {
      accessorKey: "user",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="User" />
      ),
      cell: ({ row }) => {
        const user = row.original.clerkUser;
        if (!user) {
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">Unknown User</div>
                <div className="text-muted-foreground text-sm">
                  {row.original.admin.userId}
                </div>
              </div>
            </div>
          );
        }

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
        <TableColumnHeader key={column.id} column={column} title="Role" />
      ),
      cell: () => <Badge variant="destructive">Site Admin</Badge>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const user = row.original.clerkUser;
        return (
          <div className="flex justify-end">
            <RemoveAdminButton
              userId={row.original.admin.userId}
              userName={user?.fullName ?? "Unknown User"}
            />
          </div>
        );
      },
    },
  ];

  return (
    <TableProvider
      columns={columns}
      data={adminsWithUsers}
      className="rounded-lg border"
    >
      <TableHeader>
        {({ headerGroup }) => (
          <TableHeaderGroup headerGroup={headerGroup}>
            {({ header }) => <TableHead key={header.id} header={header} />}
          </TableHeaderGroup>
        )}
      </TableHeader>
      <TableBody>
        {({ row }) => (
          <TableRow row={row}>
            {({ cell }) => <TableCell key={cell.id} cell={cell} />}
          </TableRow>
        )}
      </TableBody>
    </TableProvider>
  );
}
