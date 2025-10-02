import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertEditorOrAdmin, getRequesterRole } from "./permissions";

export const getMyMembership = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const [membership, siteUser] = await Promise.all([
      ctx.db
        .query("courseUsers")
        .withIndex("by_course_and_user", (q) =>
          q
            .eq("courseId", args.courseId)
            .eq("userId", identity.tokenIdentifier),
        )
        .unique(),
      ctx.db
        .query("siteUser")
        .withIndex("by_user_id", (q) =>
          q.eq("userId", identity.tokenIdentifier),
        )
        .unique(),
    ]);

    if (siteUser?.role === "admin") {
      return {
        role: "admin",
        permissions: [
          "create_unit",
          "edit_unit",
          "delete_unit",
          "create_lesson",
          "delete_lesson",
          "reorder_lesson",
          "manage_users",
          "manage_course",
        ],
      } as const;
    }

    if (!membership) {
      return null;
    }

    return {
      role: membership.role,
      permissions: membership.permissions ?? [],
    } as const;
  },
});

export const countMembersByRole = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const role = await getRequesterRole(ctx, args.courseId);
    assertEditorOrAdmin(role);

    const members = await ctx.db
      .query("courseUsers")
      .withIndex("by_course_id", (q) => q.eq("courseId", args.courseId))
      .collect();

    const counts = members.reduce(
      (acc, m) => {
        acc[m.role] += 1;
        return acc;
      },
      { admin: 0, editor: 0, user: 0 } as {
        admin: number;
        editor: number;
        user: number;
      },
    );

    return counts;
  },
});

export const getTokenId = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    return {
      token: identity?.tokenIdentifier
    }
  },
});

// List members for a course (admin/editor or manage_users only)
export const listMembers = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const role = await getRequesterRole(ctx, args.courseId);
    assertEditorOrAdmin(role);

    const members = await ctx.db
      .query("courseUsers")
      .withIndex("by_course_id", (q) => q.eq("courseId", args.courseId))
      .collect();

    return members.map((m) => ({
      id: m._id,
      userId: m.userId,
      role: m.role,
      permissions: m.permissions ?? [],
    }));
  },
});

// Add or update a course member (admin/editor or manage_users only)
export const addOrUpdateMember = mutation({
  args: {
    courseId: v.id("courses"),
    userId: v.string(),
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("user")),
    permissions: v.optional(
      v.array(
        v.union(
          v.literal("create_unit"),
          v.literal("edit_unit"),
          v.literal("delete_unit"),
          v.literal("create_lesson"),
          v.literal("edit_lesson"),
          v.literal("delete_lesson"),
          v.literal("reorder_lesson"),
          v.literal("manage_users"),
          v.literal("manage_course"),
        ),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const role = await getRequesterRole(ctx, args.courseId);
    assertEditorOrAdmin(role);

    const existing = await ctx.db
      .query("courseUsers")
      .withIndex("by_course_and_user", (q) =>
        q.eq("courseId", args.courseId).eq("userId", args.userId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        role: args.role,
        permissions: args.permissions,
      });
      return { updated: true, created: false } as const;
    }

    await ctx.db.insert("courseUsers", {
      courseId: args.courseId,
      userId: args.userId,
      role: args.role,
      permissions: args.permissions,
    });
    return { updated: false, created: true } as const;
  },
});

// Remove a member from a course (admin/editor or manage_users only)
export const removeMember = mutation({
  args: { courseId: v.id("courses"), userId: v.string() },
  handler: async (ctx, args) => {
    const role = await getRequesterRole(ctx, args.courseId);
    assertEditorOrAdmin(role);

    const existing = await ctx.db
      .query("courseUsers")
      .withIndex("by_course_and_user", (q) =>
        q.eq("courseId", args.courseId).eq("userId", args.userId),
      )
      .unique();
    if (!existing) {
      return { removed: false } as const;
    }
    await ctx.db.delete(existing._id);
    return { removed: true } as const;
  },
});
