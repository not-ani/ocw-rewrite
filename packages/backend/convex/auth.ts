import { ConvexError, v } from "convex/values";
import {
	customMutation,
	customQuery,
} from "convex-helpers/server/customFunctions";
import type { CustomCtx } from "convex-helpers/server/customFunctions";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export type UserRole = "admin" | "editor" | "user";
export type SiteRole = "admin" | null;

export type AuthUser = {
	userId: string; // Clerk token identifier
	siteRole: SiteRole;
	school: string;
};

export type CourseMembership = {
	_id: Id<"courseUsers">;
	role: UserRole;
	permissions?: string[];
};

export type AuthContext = {
	user: AuthUser;
	courseMembership?: CourseMembership;
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the authenticated user's identity token.
 * Throws if not authenticated.
 */
async function getAuthenticatedUserId(ctx: QueryCtx): Promise<string> {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		throw new ConvexError({
			kind: "authentication",
			message: "Not authenticated",
		});
	}
	return identity.tokenIdentifier;
}

/**
 * Get the authenticated user's site role and school.
 * Returns null if user is not a site user.
 */
async function getSiteUser(
	ctx: QueryCtx,
	userId: string,
	school: string,
): Promise<{ role: SiteRole; school: string } | null> {
	const siteUser = await ctx.db
		.query("siteUser")
		.withIndex("by_user_id_and_school", (q) =>
			q.eq("userId", userId).eq("school", school),
		)
		.unique();

	if (!siteUser) {
		return null;
	}

	return {
		role: siteUser.role === "admin" ? "admin" : null,
		school: siteUser.school,
	};
}

/**
 * Get the authenticated user's course membership.
 * Returns null if user is not a member of the course.
 */
async function getCourseMembership(
	ctx: QueryCtx,
	userId: string,
	courseId: Id<"courses">,
	school: string,
): Promise<CourseMembership | null> {
	const membership = await ctx.db
		.query("courseUsers")
		.withIndex("by_course_and_user_and_school", (q) =>
			q.eq("courseId", courseId).eq("userId", userId).eq("school", school),
		)
		.unique();

	if (!membership) {
		return null;
	}

	return {
		_id: membership._id,
		role: membership.role,
		permissions: membership.permissions,
	};
}

/**
 * Ensure user is authenticated and return their auth context.
 */
async function ensureAuthenticated(
	ctx: QueryCtx,
	school: string,
): Promise<AuthUser> {
	const userId = await getAuthenticatedUserId(ctx);
	const siteUser = await getSiteUser(ctx, userId, school);

	if (!siteUser) {
		throw new ConvexError({
			kind: "authorization",
			message: "User is not a member of this school",
		});
	}

	return {
		userId,
		siteRole: siteUser.role,
		school: siteUser.school,
	};
}

/**
 * Ensure user has the required role on a course.
 * Site admins automatically have all course permissions.
 */
function ensureCourseRole(
	user: AuthUser,
	membership: CourseMembership | null,
	requiredRole: UserRole,
): void {
	// Site admins can do anything
	if (user.siteRole === "admin") {
		return;
	}

	if (!membership) {
		throw new ConvexError({
			kind: "authorization",
			message: "User is not a member of this course",
		});
	}

	const roleHierarchy: Record<UserRole, number> = {
		user: 1,
		editor: 2,
		admin: 3,
	};

	const required = roleHierarchy[requiredRole];
	const actual = roleHierarchy[membership.role];

	if (actual < required) {
		throw new ConvexError({
			kind: "authorization",
			message: `User must be at least ${requiredRole} to perform this action`,
		});
	}
}

/**
 * Ensure user is a site admin.
 */
function ensureSiteAdmin(user: AuthUser): void {
	if (user.siteRole !== "admin") {
		throw new ConvexError({
			kind: "authorization",
			message: "Site admin access required",
		});
	}
}

// ============================================================================
// Custom Functions
// ============================================================================

/**
 * Base mutation that requires authentication.
 * All authenticated mutations should use this or a variant.
 */
export const authenticatedMutation = customMutation(mutation, {
	args: {
		school: v.string(),
	},
	input: async (ctx, args) => {
		const user = await ensureAuthenticated(ctx, args.school);
		return {
			ctx: { user },
			args: { school: args.school },
		};
	},
});

/**
 * Base query that requires authentication.
 * All authenticated queries should use this or a variant.
 */
export const authenticatedQuery = customQuery(query, {
	args: {
		school: v.string(),
	},
	input: async (ctx, args) => {
		const user = await ensureAuthenticated(ctx, args.school);
		return {
			ctx: { user },
			args: { school: args.school },
		};
	},
});

/**
 * Mutation that requires site admin role.
 */
export const siteAdminMutation = customMutation(mutation, {
	args: {
		school: v.string(),
	},
	input: async (ctx, args) => {
		const user = await ensureAuthenticated(ctx, args.school);
		ensureSiteAdmin(user);
		return {
			ctx: { user },
			args: { school: args.school },
		};
	},
});

/**
 * Query that requires site admin role.
 */
export const siteAdminQuery = customQuery(query, {
	args: {
		school: v.string(),
	},
	input: async (ctx, args) => {
		const user = await ensureAuthenticated(ctx, args.school);
		ensureSiteAdmin(user);
		return {
			ctx: { user },
			args: { school: args.school },
		};
	},
});

/**
 * Create a course mutation that requires a specific role.
 * Site admins automatically have all permissions.
 *
 * Usage:
 * ```ts
 * export const myMutation = courseMutation("editor")({
 *   args: { ... },
 *   handler: async (ctx, args) => { ... }
 * });
 * ```
 */
export function courseMutation(requiredRole: UserRole) {
	return customMutation(mutation, {
		args: {
			courseId: v.id("courses"),
			school: v.string(),
		},
		input: async (ctx, args) => {
			const user = await ensureAuthenticated(ctx, args.school);
			const membership = await getCourseMembership(
				ctx,
				user.userId,
				args.courseId,
				args.school,
			);
			ensureCourseRole(user, membership, requiredRole);

			return {
				ctx: {
					user,
					courseMembership: membership ?? undefined,
					courseId: args.courseId,
				},
				args: { school: args.school },
			};
		},
	});
}

/**
 * Create a course query that requires a specific role.
 * Site admins automatically have all permissions.
 *
 * Usage:
 * ```ts
 * export const myQuery = courseQuery("user")({
 *   args: { ... },
 *   handler: async (ctx, args) => { ... }
 * });
 * ```
 */
export function courseQuery(requiredRole: UserRole) {
	return customQuery(query, {
		args: {
			courseId: v.id("courses"),
			school: v.string(),
		},
		input: async (ctx, args) => {
			const user = await ensureAuthenticated(ctx, args.school);
			const membership = await getCourseMembership(
				ctx,
				user.userId,
				args.courseId,
				args.school,
			);
			ensureCourseRole(user, membership, requiredRole);

			return {
				ctx: {
					user,
					courseMembership: membership ?? undefined,
					courseId: args.courseId,
				},
				args: { school: args.school },
			};
		},
	});
}

// ============================================================================
// Type Exports
// ============================================================================

export type AuthenticatedMutationCtx = CustomCtx<typeof authenticatedMutation>;
export type AuthenticatedQueryCtx = CustomCtx<typeof authenticatedQuery>;
export type SiteAdminMutationCtx = CustomCtx<typeof siteAdminMutation>;
export type SiteAdminQueryCtx = CustomCtx<typeof siteAdminQuery>;
export type CourseMutationCtx = CustomCtx<ReturnType<typeof courseMutation>>;
export type CourseQueryCtx = CustomCtx<ReturnType<typeof courseQuery>>;
