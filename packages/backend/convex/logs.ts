import { v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";

const LOG_ACTION_TYPES = [
	"CREATE_LESSON",
	"UPDATE_LESSON",
	"DELETE_LESSON",
	"CREATE_COURSE",
	"UPDATE_COURSE",
	"DELETE_COURSE",
	"CREATE_UNIT",
	"UPDATE_UNIT",
	"DELETE_UNIT",
	"REORDER_UNIT",
	"REORDER_LESSON",
	"DELETE_USER",
	"UPDATE_USER",
] as const;

type LogAction = (typeof LOG_ACTION_TYPES)[number];

const actionValidator = v.union(
	v.literal("CREATE_LESSON"),
	v.literal("UPDATE_LESSON"),
	v.literal("DELETE_LESSON"),
	v.literal("CREATE_COURSE"),
	v.literal("UPDATE_COURSE"),
	v.literal("DELETE_COURSE"),
	v.literal("CREATE_UNIT"),
	v.literal("UPDATE_UNIT"),
	v.literal("DELETE_UNIT"),
	v.literal("REORDER_UNIT"),
	v.literal("REORDER_LESSON"),
	v.literal("DELETE_USER"),
	v.literal("UPDATE_USER"),
);

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
		.withIndex("by_user_id_and_school", (q) =>
			q.eq("userId", identity.tokenIdentifier).eq("school", args.school),
		)
		.unique();

	if (!siteUser || siteUser.role !== "admin") {
		throw new Error("Not authorized - site admin access required");
	}

	return identity;
}

/**
 * Get logs with filtering options
 */
export const getLogs = query({
	args: {
		school: v.string(),
		action: v.optional(actionValidator),
		userId: v.optional(v.string()),
		courseId: v.optional(v.id("courses")),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
		limit: v.optional(v.number()),
	},
	returns: v.array(
		v.object({
			_id: v.id("logs"),
			_creationTime: v.number(),
			school: v.string(),
			userId: v.string(),
			lessonId: v.optional(v.id("lessons")),
			unitId: v.optional(v.id("units")),
			courseId: v.optional(v.id("courses")),
			action: actionValidator,
			timestamp: v.optional(v.number()),
			// Enriched data
			courseName: v.optional(v.string()),
			unitName: v.optional(v.string()),
			lessonName: v.optional(v.string()),
		}),
	),
	handler: async (ctx, args) => {
		await assertSiteAdmin(ctx, args);

		const limit = args.limit ?? 100;

		// Choose the right index based on filters
		let logsQuery;

		if (args.action && args.userId) {
			// Filter by both user and action
			logsQuery = ctx.db
				.query("logs")
				.withIndex("by_user_and_action_and_school", (q) =>
					q
						.eq("userId", args.userId as string)
						.eq("action", args.action as LogAction)
						.eq("school", args.school),
				);
		} else if (args.action) {
			// Filter by action only
			logsQuery = ctx.db
				.query("logs")
				.withIndex("by_action_and_school", (q) =>
					q.eq("action", args.action as LogAction).eq("school", args.school),
				);
		} else if (args.userId) {
			// Filter by user only
			logsQuery = ctx.db
				.query("logs")
				.withIndex("by_user_id_and_school", (q) =>
					q.eq("userId", args.userId as string).eq("school", args.school),
				);
		} else if (args.courseId) {
			// Filter by course
			logsQuery = ctx.db
				.query("logs")
				.withIndex("by_course_id_and_school", (q) =>
					q.eq("courseId", args.courseId).eq("school", args.school),
				);
		} else {
			// No specific filter - need to scan and filter by school
			// Unfortunately there's no index for just school, so we'll need to collect and filter
			logsQuery = ctx.db.query("logs");
		}

		// Get logs in descending order (most recent first)
		const logs = await logsQuery.order("desc").take(limit * 2);

		// Apply date filters and school filter in memory if needed
		const filteredLogs = logs.filter((log) => {
			// Filter by school if we didn't use an index that includes school
			if (log.school !== args.school) {
				return false;
			}

			// Filter by course if specified and not already filtered by index
			if (args.courseId && !args.action && !args.userId) {
				// Already filtered by index
			} else if (args.courseId && log.courseId !== args.courseId) {
				return false;
			}

			// Filter by date range
			const logTime = log.timestamp ?? log._creationTime;
			if (args.startDate && logTime < args.startDate) {
				return false;
			}
			if (args.endDate && logTime > args.endDate) {
				return false;
			}

			return true;
		});

		// Take the limit
		const limitedLogs = filteredLogs.slice(0, limit);

		// Enrich logs with related data
		const enrichedLogs = await Promise.all(
			limitedLogs.map(async (log) => {
				let courseName: string | undefined;
				let unitName: string | undefined;
				let lessonName: string | undefined;

				if (log.courseId) {
					const course = await ctx.db.get(log.courseId);
					courseName = course?.name;
				}

				if (log.unitId) {
					const unit = await ctx.db.get(log.unitId);
					unitName = unit?.name;
				}

				if (log.lessonId) {
					const lesson = await ctx.db.get(log.lessonId);
					lessonName = lesson?.name;
				}

				return {
					...log,
					courseName,
					unitName,
					lessonName,
				};
			}),
		);

		return enrichedLogs;
	},
});

/**
 * Get unique users who have logs for filtering dropdown
 */
export const getLogUsers = query({
	args: {
		school: v.string(),
	},
	returns: v.array(v.string()),
	handler: async (ctx, args) => {
		await assertSiteAdmin(ctx, args);

		// Get a sample of logs to extract unique users
		const logs = await ctx.db.query("logs").order("desc").take(500);

		const filteredLogs = logs.filter((log) => log.school === args.school);

		const uniqueUsers = [...new Set(filteredLogs.map((log) => log.userId))];

		return uniqueUsers;
	},
});

/**
 * Get action types for filtering dropdown
 */
export const getActionTypes = query({
	args: {},
	returns: v.array(v.string()),
	handler: async () => {
		return [...LOG_ACTION_TYPES];
	},
});

