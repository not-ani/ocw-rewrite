"use client";

import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { AddUserDialog } from "@/components/dashboard/users/add-user-dialog";
import { UsersTable } from "@/components/dashboard/users/users-table";
import { useSite } from "@/lib/multi-tenant/context";

type ClerkUser = {
	id: string;
	clerkId: string;
	email: string;
	fullName: string;
	imageUrl: string;
};

type UsersClientProps = {
	courseId: Id<"courses">;
	allClerkUsers: ClerkUser[];
	canManageUsers: boolean;
};

export function UsersClient({
	courseId,
	allClerkUsers,
	canManageUsers,
}: UsersClientProps) {
	const { subdomain } = useSite();
	const members = useQuery(api.courseUsers.listMembers, {
		courseId,
		school: subdomain,
	});

	const usersWithMembership = useMemo(() => {
		if (!members) return [];

		return members
			.map((member) => {
				const clerkUser = allClerkUsers.find((u) => u.id === member.userId);
				if (!clerkUser) return null;

				return {
					clerkUser,
					membership: member,
				};
			})
			.filter((item): item is NonNullable<typeof item> => item !== null);
	}, [members, allClerkUsers]);

	const existingUserIds = useMemo(
		() => new Set(members?.map((m) => m.userId) ?? []),
		[members],
	);

	if (members === undefined) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (members === null) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="text-center">
					<h3 className="font-semibold text-lg">Access Denied</h3>
					<p className="text-muted-foreground text-sm">
						You don&apos;t have permission to view course members.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="space-y-1">
					<h2 className="font-semibold text-2xl">Course Members</h2>
					<p className="text-muted-foreground text-sm">
						Manage users and their roles for this course
					</p>
				</div>
				{canManageUsers && (
					<AddUserDialog
						courseId={courseId}
						availableUsers={allClerkUsers}
						existingUserIds={existingUserIds}
					/>
				)}
			</div>

			<UsersTable
				courseId={courseId}
				users={usersWithMembership}
				canEdit={canManageUsers}
			/>

			{usersWithMembership.length === 0 && (
				<div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
					<div className="text-center">
						<h3 className="font-medium text-sm">No members yet</h3>
						<p className="mt-1 text-muted-foreground text-xs">
							Add users to this course to get started
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
