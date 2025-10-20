"use client";

import { type api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Preloaded } from "convex/react";
import { usePreloadedQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { AddAdminDialog } from "@/components/admin/add-admin-dialog";
import { AdminsTable } from "@/components/admin/admins-table";
import { CoursesTable } from "@/components/admin/courses-table";

type ClerkUser = {
  id: string;
  clerkId: string;
  email: string;
  fullName: string;
  imageUrl: string;
};

type AdminPageClientProps = {
  preloadedCourses: Preloaded<typeof api.admin.getAllCourses>;
  preloadedAdmins: Preloaded<typeof api.admin.getAllSiteAdmins>;
};

export function AdminPageClient({
  preloadedCourses,
  preloadedAdmins,
}: AdminPageClientProps) {
  const courses = usePreloadedQuery(preloadedCourses);
  const admins = usePreloadedQuery(preloadedAdmins);

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
    () => new Set(admins.map((admin) => {
      // Extract the Clerk user ID from the tokenIdentifier (format: "issuer|userId")
      return admin.userId.split("|").pop() ?? admin.userId;
    })),
    [admins],
  );

  const adminsWithUsers = useMemo(() => {
    return admins.map((admin) => {
      // Extract the Clerk user ID from the tokenIdentifier (format: "issuer|userId")
      const clerkUserId = admin.userId.split("|").pop() ?? admin.userId;
      
      return {
        admin,
        clerkUser: clerkUsers.find((user) => user.id === clerkUserId) ?? null,
      };
    });
  }, [admins, clerkUsers]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Site Administration</h1>
          <p className="text-muted-foreground">
            Manage courses and site administrators across the platform
          </p>
        </div>
      </div>

      {/* Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">All Courses</h2>
          <p className="text-muted-foreground text-sm">
            {courses.length} {courses.length === 1 ? "course" : "courses"} total
          </p>
        </div>
        <CoursesTable courses={courses} />
      </div>

      {/* Site Admins Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Site Administrators</h2>
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
