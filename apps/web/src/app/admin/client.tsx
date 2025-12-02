"use client";

import { api } from "@ocw/backend/convex/_generated/api";
import { Authenticated, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { AddAdminDialog } from "@/components/admin/add-admin-dialog";
import { AddCourseDialog } from "@/components/admin/add-course-dialog";
import { AdminsTable } from "@/components/admin/admins-table";
import { CoursesTable } from "@/components/admin/courses-table";
import { ForkCourseDialog } from "@/components/admin/fork-course-dialog";

type ClerkUser = {
	id: string;
	clerkId: string;
	email: string;
	fullName: string;
	imageUrl: string;
};

type AdminPageClientProps = {
	subdomain: string;
};

export function AdminPageClient({ subdomain }: AdminPageClientProps) {
	return (
		<Authenticated>
			<AdminPageClientContent subdomain={subdomain} />
		</Authenticated>
	);
}
function AdminPageClientContent({ subdomain }: AdminPageClientProps) {
	const courses = useQuery(api.admin.getAllCourses, {
		school: subdomain,
	});
	const admins = useQuery(api.admin.getAllSiteAdmins, {
		school: subdomain,
	});

	const [clerkUsers, setClerkUsers] = useState<ClerkUser[]>([]);

	useEffect(() => {
		async function fetchUsers() {
			const response = await fetch("/api/clerk-users");
			if (response.ok) {
				const users = await response.json();
				setClerkUsers(users);
			}
		}
		fetchUsers();
	}, []);

	const existingAdminIds = useMemo(
		() =>
			new Set(
				(admins ?? []).map((admin) => {
					// Extract the Clerk user ID from the tokenIdentifier (format: "issuer|userId")
					return admin.userId.split("|").pop() ?? admin.userId;
				}),
			),
		[admins],
	);

	const adminsWithUsers = useMemo(() => {
		if (!admins) return [];
		return admins.map((admin) => {
			// Extract the Clerk user ID from the tokenIdentifier (format: "issuer|userId")
			const clerkUserId = admin.userId.split("|").pop() ?? admin.userId;

			return {
				admin,
				clerkUser: clerkUsers.find((user) => user.id === clerkUserId) ?? null,
			};
		});
	}, [admins, clerkUsers]);

	if (courses === undefined || admins === undefined) {
		return (
			<div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6">
				<div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
					<div className="space-y-1">
						<h1 className="font-bold text-3xl">Site Administration</h1>
						<p className="text-muted-foreground">Loading...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6">
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
				<div className="space-y-1">
					<h1 className="font-bold text-3xl">Site Administration</h1>
					<p className="text-muted-foreground">
						Manage courses and site administrators across the platform
					</p>
				</div>
			</div>

			{/* Courses Section */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<h2 className="font-semibold text-2xl">All Courses</h2>
						<p className="text-muted-foreground text-sm">
							{courses.length} {courses.length === 1 ? "course" : "courses"}{" "}
							total
						</p>
					</div>
					<div className="flex items-center gap-2">
						<ForkCourseDialog />
						<AddCourseDialog />
					</div>
				</div>
				<CoursesTable courses={courses} />
			</div>

			{/* Site Admins Section */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-2xl">Site Administrators</h2>
					<AddAdminDialog
						availableUsers={clerkUsers}
						existingAdminIds={existingAdminIds}
					/>
				</div>
				<AdminsTable adminsWithUsers={adminsWithUsers} />
			</div>
		</div>
	);
}
