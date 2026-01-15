import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import { getAuthToken } from "./auth";
import { extractSubdomain } from "./multi-tenant/server";
import { LRUCache } from "lru-cache";
import { cache } from "react";
import { Effect } from "effect";

const permissionCache = new LRUCache<string, boolean>({
  max: 1_000,
  ttl: 1000 * 60 * 5,
});

const getAuthContext = cache(() =>
  Effect.runPromise(
    Effect.gen(function* () {
      const { userId } = yield* Effect.promise(() => auth());

      if (!userId) {
        return { userId: null, token: null, subdomain: null };
      }

      const { token, subdomain } = yield* Effect.all({
        token: Effect.promise(() => getAuthToken()),
        subdomain: Effect.promise(() => extractSubdomain()),
      });

      return { userId, token, subdomain };
    }),
  ),
);

export async function checkUserManagementPermission(courseId: Id<"courses">) {
  return Effect.runPromise(
    Effect.gen(function* () {
      const { userId, token, subdomain } = yield* Effect.promise(() =>
        getAuthContext(),
      );

      if (!userId || !token || !subdomain) {
        return { authorized: false, membership: null } as const;
      }

      const cacheKey = `${userId}:${subdomain}:${courseId}:manage-users`;
      const cached = permissionCache.get(cacheKey);

      if (cached !== undefined) {
        return { authorized: cached, membership: null } as const;
      }

      const { siteUser, membership } = yield* Effect.all({
        siteUser: Effect.promise(() =>
          fetchQuery(
            api.permissions.getSiteUser,
            { school: subdomain },
            { token },
          ),
        ),
        membership: Effect.promise(() =>
          fetchQuery(
            api.courseUsers.getMyMembership,
            { courseId, school: subdomain },
            { token },
          ),
        ),
      });

      const isSiteAdmin = siteUser?.role === "admin";

      const canManage =
        isSiteAdmin ||
        membership?.role === "admin" ||
        membership?.role === "editor" ||
        membership?.permissions.includes("manage_users");

      permissionCache.set(cacheKey, !!canManage);

      if (isSiteAdmin) {
        return {
          authorized: true,
          membership: { role: "admin", permissions: ["manage_users"] },
        } as const;
      }

      return { authorized: !!canManage, membership } as const;
    }),
  );
}

export async function checkAdminOrEditorPermission(courseId: Id<"courses">) {
  return Effect.runPromise(
    Effect.gen(function* () {
      const { userId, token, subdomain } = yield* Effect.promise(() =>
        getAuthContext(),
      );

      if (!userId || !token || !subdomain) {
        return { authorized: false, membership: null } as const;
      }

      const cacheKey = `${userId}:${subdomain}:${courseId}:admin-editor`;
      const cached = permissionCache.get(cacheKey);

      if (cached !== undefined) {
        return { authorized: cached, membership: null } as const;
      }

      const { siteUser, membership } = yield* Effect.all({
        siteUser: Effect.promise(() =>
          fetchQuery(
            api.permissions.getSiteUser,
            { school: subdomain },
            { token },
          ),
        ),
        membership: Effect.promise(() =>
          fetchQuery(
            api.courseUsers.getMyMembership,
            { courseId, school: subdomain },
            { token },
          ),
        ),
      });

      const isAuthorized =
        siteUser?.role === "admin" ||
        membership?.role === "admin" ||
        membership?.role === "editor";

      permissionCache.set(cacheKey, !!isAuthorized);

      return { authorized: !!isAuthorized, membership } as const;
    }),
  );
}

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
