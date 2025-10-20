import "server-only";

import { clerkClient } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { getAuthToken } from "./auth";
import { extractSubdomain } from "./multi-tenant/server";
/**
 * Check if the current user has permission to manage users for a course
 * This is a server-side only function
 */
export async function checkUserManagementPermission(courseId: Id<"courses">) {
  const token = await getAuthToken();
  const subdomain = await extractSubdomain();
  if (!subdomain) {
    return { authorized: false, membership: null } as const;
  }
  if (!token) {
    return { authorized: false, membership: null } as const;
  }

  const siteUser = await fetchQuery(
    api.permissions.getSiteUser,
    { school: subdomain },
    { token },
  );

  const membership = await fetchQuery(
    api.courseUsers.getMyMembership,
    { courseId, school: subdomain },
    { token },
  );

  const membershipData = membership;

  const isSiteAdmin = siteUser?.role === "admin";
  const isCourseAdmin = membershipData?.role === "admin";
  const isCourseEditor = membershipData?.role === "editor";

  const canManage =
    membershipData &&
    (isCourseAdmin ||
      isCourseEditor ||
      (Array.isArray(membershipData.permissions) &&
        membershipData.permissions.includes("manage_users")));

  if (isSiteAdmin) {
    return {
      authorized: true,
      membership: { role: "admin", permissions: ["manage_users"] },
    } as const;
  }

  return { authorized: canManage, membership: membershipData } as const;
}

export async function checkAdminOrEditorPermission(courseId: Id<"courses">) {
  const token = await getAuthToken();
  const subdomain = await extractSubdomain();
  if (!subdomain) {
    return { authorized: false, membership: null } as const;
  }
  if (!token) {
    return { authorized: false, membership: null } as const;
  }

  const siteUser = await fetchQuery(
    api.permissions.getSiteUser,
    { school: subdomain },
    { token },
  );

  const membership = await fetchQuery(
    api.courseUsers.getMyMembership,
    { courseId, school: subdomain },
    { token },
  );

  const membershipData = membership;

  const isCourseAdmin =
    siteUser?.role === "admin" || membershipData?.role === "admin";
  const isCourseEditor =
    siteUser?.role === "admin" || membershipData?.role === "editor";
  const isAuthorized = membershipData && (isCourseAdmin || isCourseEditor);

  return { authorized: isAuthorized, membership: membershipData } as const;
}

/**
 * Fetch all organization users from Clerk
 * Returns users with basic information needed for display
 */
export async function getAllClerkUsers() {
  const client = await clerkClient();

  try {
    const { data: users } = await client.users.getUserList({
      limit: 100,
      orderBy: "-created_at",
    });

    return users.map((user) => ({
      id: user.id,
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress ?? "",
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      fullName:
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
        "Unknown User",
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching Clerk users:", error);
    return [];
  }
}

/**
 * Get a single Clerk user by ID
 */
export async function getClerkUser(userId: string) {
  const client = await clerkClient();

  try {
    const user = await client.users.getUser(userId);
    return {
      id: user.id,
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress ?? "",
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      fullName:
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
        "Unknown User",
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error("Error fetching Clerk user:", error);
    return null;
  }
}
