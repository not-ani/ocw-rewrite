import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { courseMutation, courseQuery } from "./auth";

export const getTableData = courseQuery("user")({
	args: { courseId: v.id("courses"), school: v.string() },
	handler: async (ctx) => {
		// Use compound index with order to avoid sorting in memory
		const units = await ctx.db
			.query("units")
			.withIndex("by_course_id_and_order", (q) =>
				q.eq("courseId", ctx.courseId),
			)
			.collect();

		return units.map((u) => ({
			id: u._id,
			name: u.name,
			isPublished: u.isPublished,
			courseId: u.courseId,
			order: u.order,
		}));
	},
});

export const getById = query({
	args: { id: v.id("units"), school: v.string() },
	handler: async (ctx, args) => {
		const unit = await ctx.db.get(args.id);
		if (!unit) {
			return null;
		}
		// Validate unit belongs to the requested school
		if (unit.school !== args.school) {
			return null;
		}
		return unit;
	},
});

export const searchByCourse = query({
	args: {
		courseId: v.id("courses"),
		searchTerm: v.string(),
	},
	handler: async (ctx, args) => {
		if (!args.searchTerm.trim()) {
			return [];
		}

		const units = await ctx.db
			.query("units")
			.withSearchIndex("search_name", (q) =>
				q.search("name", args.searchTerm).eq("courseId", args.courseId),
			)
			.take(10);

		return units.map((unit) => ({
			id: unit._id,
			name: unit.name,
			isPublished: unit.isPublished,
		}));
	},
});

export const getUnitWithLessons = query({
	args: { id: v.id("units") },
	handler: async (ctx, args) => {
		const unit = await ctx.db.get(args.id);

		if (!unit) {
			return null;
		}

		const course = await ctx.db.get(unit.courseId);

		if (!course) {
			return null;
		}

		// Use compound index with isPublished to avoid filter
		const lessons = await ctx.db
			.query("lessons")
			.withIndex("by_unit_id_and_is_published", (q) =>
				q.eq("unitId", unit._id).eq("isPublished", true),
			)
			.order("asc")
			.collect();

		return {
			...unit,
			_id: unit._id,
			course: {
				_id: course._id,
				name: course.name,
			},
			lessons: lessons.map((lesson) => ({
				id: lesson._id,
				name: lesson.name,
				contentType: lesson.contentType,
				order: lesson.order,
			})),
		};
	},
});

export const create = courseMutation("editor")({
	args: {
		description: v.optional(v.string()),
		isPublished: v.optional(v.boolean()),
		unitName: v.string(),
		courseId: v.id("courses"),
		school: v.string(),
	},
	handler: async (ctx, args) => {
			const count = await ctx.db
				.query("units")
				.withIndex("by_course_id", (q) => q.eq("courseId", ctx.courseId))
				.collect();

			const order = count.length;
			const id = await ctx.db.insert("units", {
				school: args.school,
				courseId: ctx.courseId,
				name: args.unitName,
				description: args.description ?? undefined,
				isPublished: args.isPublished ?? false,
				order,
			});

			await ctx.db.insert("logs", {
				userId: ctx.user.userId,
				courseId: ctx.courseId,
				school: args.school,
				action: "CREATE_UNIT",
				timestamp: Date.now(),
				unitId: id,
			});

		return id;
	},
});

export const update = courseMutation("editor")({
	args: {
		data: v.object({
			id: v.id("units"),
			name: v.optional(v.string()),
			isPublished: v.optional(v.boolean()),
			description: v.optional(v.union(v.string(), v.null())),
		}),
		courseId: v.id("courses"),
		school: v.string(),
	},
	handler: async (ctx, args) => {
			const unit = await ctx.db.get(args.data.id);
			if (!(unit && unit.courseId === ctx.courseId)) {
				throw new ConvexError("Unit not found");
			}

			await ctx.db.patch(args.data.id, {
				name: args.data.name ?? unit.name,
				isPublished: args.data.isPublished ?? unit.isPublished,
				description:
					args.data.description === undefined
						? unit.description
						: (args.data.description ?? undefined),
			});

			await ctx.db.insert("logs", {
				userId: ctx.user.userId,
				courseId: ctx.courseId,
				unitId: args.data.id,
				action: "UPDATE_UNIT",
				school: args.school,
				timestamp: Date.now(),
			});
		},
	},
);

export const reorder = courseMutation("editor")({
	args: {
		data: v.array(
			v.object({
				id: v.id("units"),
				position: v.number(),
			}),
		),
		courseId: v.id("courses"),
		school: v.string(),
	},
	handler: async (ctx, args) => {
			// Update each unit order to the provided position
			for (const item of args.data) {
				const unit = await ctx.db.get(item.id);
				if (
					unit &&
					unit.courseId === ctx.courseId &&
					unit.order !== item.position
				) {
					await ctx.db.patch(item.id, { order: item.position });
				}
			}

			await ctx.db.insert("logs", {
				userId: ctx.user.userId,
				courseId: ctx.courseId,
				action: "REORDER_UNIT",
				school: args.school,
				timestamp: Date.now(),
			});
		},
	},
);

export const remove = courseMutation("editor")({
	args: {
		id: v.id("units"),
		courseId: v.id("courses"),
		school: v.string(),
	},
	handler: async (ctx, args) => {
			const unit = await ctx.db.get(args.id);
			if (!(unit && unit.courseId === ctx.courseId)) {
				throw new ConvexError("Unit not found");
			}

			await ctx.db.delete(args.id);

			// Use compound index with order to avoid sorting in memory
			const remaining = await ctx.db
				.query("units")
				.withIndex("by_course_id_and_order", (q) =>
					q.eq("courseId", ctx.courseId),
				)
				.collect();
			for (const [index, u] of remaining.entries()) {
				if (u.order !== index) {
					await ctx.db.patch(u._id, { order: index });
				}
			}

			await ctx.db.insert("logs", {
				userId: ctx.user.userId,
				courseId: ctx.courseId,
				unitId: args.id,
				action: "DELETE_UNIT",
				school: args.school,
				timestamp: Date.now(),
			});
		},
	},
);
