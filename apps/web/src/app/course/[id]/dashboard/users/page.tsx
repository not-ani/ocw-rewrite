import { SignInButton } from "@clerk/nextjs";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { notFound, redirect } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import { isValidConvexId } from "@/lib/convex-utils";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import {
	checkUserManagementPermission,
	getAllClerkUsers,
} from "@/lib/permissions";
import { UsersClient } from "./client";

export default async function UsersPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id: courseId } = await params;
	const token = await getAuthToken();
	const subdomain = await extractSubdomain();

	if (!token) {
		return (
			<div className="mx-auto flex min-h-[400px] max-w-xl items-center justify-center p-4">
				<div className="text-center">
					<h1 className="mb-2 font-semibold text-2xl">Sign in required</h1>
					<p className="mb-4 text-muted-foreground">
						Sign in to manage course members.
					</p>
					<SignInButton />
				</div>
			</div>
		);
	}

	if (!subdomain) {
		notFound();
	}

	if (!isValidConvexId(courseId)) {
		notFound();
	}

	const { authorized } = await checkUserManagementPermission(
		courseId as Id<"courses">,
	);

	if (!authorized) {
		redirect("/unauthorized");
	}

	const allClerkUsers = await getAllClerkUsers();

	return (
		<div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
			<UsersClient
				courseId={courseId as Id<"courses">}
				allClerkUsers={allClerkUsers}
				canManageUsers={authorized}
			/>
		</div>
	);
}
