import { ConvexError, v } from "convex/values";
import { siteAdminMutation, siteAdminQuery } from "./auth";
import { query } from "./_generated/server";

/**
 * Get all courses for site admin dashboard
 * Requires site admin access.
 */
export const getAllCourses = siteAdminQuery({
	args: { school: v.string() },
	handler: async (ctx, args) => {

		const courses = await ctx.db
			.query("courses")
			.withIndex("by_school", (q) => q.eq("school", args.school))
			.collect();

		return courses;
	},
});

/**
 * Update course publish status
 * Requires site admin access.
 */
export const updateCourseStatus = siteAdminMutation({
	args: {
		courseId: v.id("courses"),
		isPublic: v.boolean(),
		school: v.string(),
	},
	handler: async (ctx, args) => {

		await ctx.db.patch(args.courseId, {
			isPublic: args.isPublic,
		});

		return null;
	},
});

/**
 * Get all site admins
 * Requires site admin access.
 */
export const getAllSiteAdmins = siteAdminQuery({
	args: { school: v.string() },
	handler: async (ctx, args) => {

		const admins = await ctx.db
			.query("siteUser")
			.withIndex("by_school", (q) => q.eq("school", args.school))
			.collect();

		return admins;
	},
});

/**
 * Add a site admin
 * Requires site admin access.
 */
export const addSiteAdmin = siteAdminMutation({
	args: {
		userId: v.string(),
		school: v.string(),
	},
	handler: async (ctx, args) => {

		// Check if user is already an admin
		const existing = await ctx.db
			.query("siteUser")
			.withIndex("by_user_id_and_school", (q) =>
				q.eq("userId", args.userId).eq("school", args.school),
			)
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
 * Requires site admin access.
 * 
 * Bespoke authorization: Users cannot remove themselves as admins.
 */
export const removeSiteAdmin = siteAdminMutation({
	args: {
		userId: v.string(),
		school: v.string(),
	},
	handler: async (ctx, args) => {
		// Prevent removing yourself - endpoint-specific authorization
		if (ctx.user.userId === args.userId) {
			throw new ConvexError("Cannot remove yourself as an admin");
		}

		const siteUser = await ctx.db
			.query("siteUser")
			.withIndex("by_user_id_and_school", (q) =>
				q.eq("userId", args.userId).eq("school", args.school),
			)
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
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity) {
			return false;
		}

		const siteUser = await ctx.db
			.query("siteUser")
			.withIndex("by_user_id_and_school", (q) =>
				q.eq("userId", identity.tokenIdentifier).eq("school", args.school),
			)
			.unique();

		return siteUser?.role === "admin";
	},
});

/**
 * Create a new course
 * Requires site admin access.
 */
export const createCourse = siteAdminMutation({
	args: {
		name: v.string(),
		description: v.string(),
		subjectId: v.string(),
		isPublic: v.boolean(),
		imageUrl: v.optional(v.string()),
		school: v.string(),
	},
	handler: async (ctx, args) => {

		const courseId = await ctx.db.insert("courses", {
			name: args.name,
			description: args.description,
			subjectId: args.subjectId,
			isPublic: args.isPublic,
			imageUrl: args.imageUrl,
			aliases: [],
			unitLength: 0,
			school: args.school,
		});

		return courseId;
	},
});
