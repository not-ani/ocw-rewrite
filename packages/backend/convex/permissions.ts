import type { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";

type GetRequesterRole = {
  courseRole: "admin" | "editor" | "user" | null;
  siteRole: "admin" | null;
};

export async function getRequesterRole(
  ctx: QueryCtx,
  courseId: Id<"courses">
): Promise<GetRequesterRole | null> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  const membership = await ctx.db
    .query("courseUsers")
    .withIndex("by_course_and_user", (q) =>
      q.eq("courseId", courseId).eq("userId", identity.tokenIdentifier)
    )
    .unique();

  const siteUser = await ctx.db
    .query("siteUser")
    .withIndex("by_user_id", (q) => q.eq("userId", identity.tokenIdentifier))
    .unique();

  return {
    courseRole: membership?.role ?? null,
    siteRole: siteUser?.role ?? null,
  };
}
export const getSiteUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return await ctx.db.query("siteUser").withIndex("by_user_id", (q) => q.eq("userId", identity.tokenIdentifier)).unique();
  },
});

export function assertEditorOrAdmin(requesterInfo: GetRequesterRole | null) {
  const hasCourseRole =
    requesterInfo?.courseRole === "admin" ||
    requesterInfo?.courseRole === "editor";

  const hasSiteRole = requesterInfo?.siteRole === "admin";
  if (!(hasCourseRole || hasSiteRole)) {
    throw new Error("Not authorized");
  }
}
