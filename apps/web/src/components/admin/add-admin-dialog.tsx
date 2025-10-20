"use client";

import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { Check, ChevronsUpDown, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useSite } from "@/lib/multi-tenant/context";

type ClerkUser = {
  id: string;
  clerkId: string;
  email: string;
  fullName: string;
  imageUrl: string;
};

type AddAdminDialogProps = {
  availableUsers: ClerkUser[];
  existingAdminIds: Set<string>;
};

export function AddAdminDialog({
  availableUsers,
  existingAdminIds,
}: AddAdminDialogProps) {
  const [open, setOpen] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const { subdomain } = useSite();
  const addAdmin = useMutation(api.admin.addSiteAdmin);

  const eligibleUsers = availableUsers.filter(
    (user) => !existingAdminIds.has(user.id),
  );

  const selectedUser = eligibleUsers.find((user) => user.id === selectedUserId);

  const handleAdd = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    setIsAdding(true);
    try {
      await addAdmin({ userId: selectedUserId, school: subdomain });
      toast.success("Admin added successfully");
      setOpen(false);
      setSelectedUserId("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add admin",
      );
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Site Admin</DialogTitle>
          <DialogDescription>
            Grant site-wide administrative privileges to a user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select User</label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between"
                >
                  {selectedUser ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={selectedUser.imageUrl}
                          alt={selectedUser.fullName}
                        />
                        <AvatarFallback>
                          {selectedUser.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedUser.fullName}</span>
                    </div>
                  ) : (
                    "Select user..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[460px] p-0">
                <Command>
                  <CommandInput placeholder="Search users..." />
                  <CommandList>
                    <CommandEmpty>No users found.</CommandEmpty>
                    <CommandGroup>
                      {eligibleUsers.map((user) => {
                        const initials = user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2);

                        return (
                          <CommandItem
                            key={user.id}
                            value={user.fullName + " " + user.email}
                            onSelect={() => {
                              setSelectedUserId(user.id);
                              setComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedUserId === user.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <Avatar className="mr-2 h-8 w-8">
                              <AvatarImage
                                src={user.imageUrl}
                                alt={user.fullName}
                              />
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span>{user.fullName}</span>
                              <span className="text-muted-foreground text-xs">
                                {user.email}
                              </span>
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedUserId || isAdding}>
            {isAdding ? "Adding..." : "Add Admin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
