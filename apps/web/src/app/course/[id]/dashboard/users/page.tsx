import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { preloadQuery } from "convex/nextjs";
import { redirect, notFound } from "next/navigation";
import { SignInButton } from "@clerk/nextjs";
import { UsersClient } from "./client";
import {
  checkUserManagementPermission,
  getAllClerkUsers,
} from "@/lib/permissions";
import { getAuthToken } from "@/lib/auth";
import { isValidConvexId } from "@/lib/convex-utils";
import { extractSubdomain } from "@/lib/multi-tenant/server";

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
          <h1 className="mb-2 text-2xl font-semibold">Sign in required</h1>
          <p className="text-muted-foreground mb-4">
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

  const { authorized, membership } = await checkUserManagementPermission(
    courseId as Id<"courses">,
  );

  if (!authorized) {
    redirect(`/course/${courseId}/dashboard`);
  }

  const allClerkUsers = await getAllClerkUsers();

  const preloadedMembers = await preloadQuery(
    api.courseUsers.listMembers,
    { courseId: courseId as Id<"courses">, school: subdomain },
    { token },
  );

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
