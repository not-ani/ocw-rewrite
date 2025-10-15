import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";

/**
 * Check if the current user is a site admin
 */
async function assertSiteAdmin(ctx: QueryCtx, args: { school: string }) {
  const identity = await ctx.auth.getUserIdentity();
  
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const siteUser = await ctx.db
    .query("siteUser")
    .withIndex("by_user_id_and_school", q => q.eq("userId", identity.tokenIdentifier).eq("school", args.school))
    .unique();

  if (!siteUser || siteUser.role !== "admin") {
    throw new Error("Not authorized - site admin access required");
  }

  return identity;
}

/**
 * Get all courses for site admin dashboard
 */
export const getAllCourses = query({
  args: { school: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("courses"),
      _creationTime: v.number(),
      id: v.optional(v.string()),
      subjectId: v.string(),
      name: v.string(),
      aliases: v.array(v.string()),
      isPublic: v.boolean(),
      imageUrl: v.optional(v.string()),
      unitLength: v.number(),
      description: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    await assertSiteAdmin(ctx, args);

    const courses = await ctx.db.query("courses").withIndex("by_is_public_and_school", q => q.eq("isPublic", true).eq("school", args.school)).collect();
    
    return courses;
  },
});

/**
 * Update course publish status
 */
export const updateCourseStatus = mutation({
  args: {
    courseId: v.id("courses"),
    isPublic: v.boolean(),
    school: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertSiteAdmin(ctx, args);

    await ctx.db.patch(args.courseId, {
      isPublic: args.isPublic,
    });

    return null;
  },
});

/**
 * Get all site admins
 */
export const getAllSiteAdmins = query({
  args: { school: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("siteUser"),
      _creationTime: v.number(),
      userId: v.string(),
      role: v.union(v.literal("admin")),
    })
  ),
  handler: async (ctx, args) => {
    await assertSiteAdmin(ctx, args);

    const admins = await ctx.db
      .query("siteUser")
      .withIndex("by_school", q => q.eq("school", args.school))
      .collect();

    return admins;
  },
});

/**
 * Add a site admin
 */
export const addSiteAdmin = mutation({
  args: {
    userId: v.string(),
    school: v.string(),
  },
  returns: v.id("siteUser"),
  handler: async (ctx, args) => {
    await assertSiteAdmin(ctx, args);

    // Check if user is already an admin
    const existing = await ctx.db
      .query("siteUser")
      .withIndex("by_user_id_and_school", q => q.eq("userId", args.userId).eq("school", args.school))
      .unique();

    if (existing) {
      throw new Error("User is already a site admin");
    }

    const id = await ctx.db.insert("siteUser", {
      userId: args.userId,
      role: "admin",
      school: args.school,
    });

    return id;
  },
});

/**
 * Remove a site admin
 */
export const removeSiteAdmin = mutation({
  args: {
    userId: v.string(),
    school: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await assertSiteAdmin(ctx, args);

    // Prevent removing yourself
    if (identity.tokenIdentifier === args.userId) {
      throw new Error("Cannot remove yourself as an admin");
    }

    const siteUser = await ctx.db
      .query("siteUser")
      .withIndex("by_user_id_and_school", q => q.eq("userId", args.userId).eq("school", args.school))
      .unique();

    if (!siteUser) {
      throw new Error("User is not a site admin");
    }

    await ctx.db.delete(siteUser._id);

    return null;
  },
});

/**
 * Check if current user is a site admin (for client-side checks)
 */
export const isSiteAdmin = query({
  args: { school: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return false;
    }

    const siteUser = await ctx.db
      .query("siteUser")
      .withIndex("by_user_id_and_school", (q) => q.eq("userId", identity.tokenIdentifier).eq("school", args.school))
      .unique();

    return siteUser?.role === "admin";
  },
});

