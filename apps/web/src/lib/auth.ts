import "server-only";

import { auth } from "@clerk/nextjs/server";
import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { LRUCache } from "lru-cache";
import { Effect } from "effect";

type CacheKey = string;

const permissionCache = new LRUCache<CacheKey, boolean>({
  max: 1_000,
  ttl: 1000 * 60 * 5,
});

export async function getAuthToken() {
  return (await (await auth()).getToken({ template: "convex" })) ?? undefined;
}

export async function checkAdminOrEditorPermission(
  courseId: Id<"courses">,
  subdomain: string,
): Promise<void> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const authData = yield* Effect.promise(() => auth());
      const userId = authData.userId;

      if (!userId) {
        redirect("/unauthorized");
      }

      const cacheKey = `${userId}:${subdomain}:${courseId}`;
      const cached = permissionCache.get(cacheKey);

      if (cached !== undefined) {
        if (!cached) redirect("/unauthorized");
        return;
      }

      const token = yield* Effect.promise(() => getAuthToken());

      if (!token) {
        permissionCache.set(cacheKey, false);
        redirect("/unauthorized");
      }

      const { isSiteAdmin, membership } = yield* Effect.all({
        isSiteAdmin: Effect.promise(() =>
          fetchQuery(api.admin.isSiteAdmin, { school: subdomain }, { token }),
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
        isSiteAdmin ||
        membership?.role === "admin" ||
        membership?.role === "editor";

      permissionCache.set(cacheKey, isAuthorized);

      if (!isAuthorized) {
        redirect("/unauthorized");
      }
    }),
  );
}
