import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertEditorOrAdmin, getRequesterRole } from "./permissions";

export const getTableData = query({
	args: { courseId: v.id("courses"), school: v.string() },
	handler: async (ctx, args) => {
		const units = await ctx.db
			.query("units")
			.withIndex("by_course_id", (q) => q.eq("courseId", args.courseId))
			.order("asc")
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
		return unit ?? null;
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

		const lessons = await ctx.db
			.query("lessons")
			.withIndex("by_unit_id", (q) => q.eq("unitId", unit._id))
			.filter((q) => q.eq(q.field("isPublished"), true))
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

export const create = mutation({
	args: {
		courseId: v.id("courses"),
		description: v.optional(v.string()),
		isPublished: v.optional(v.boolean()),
		unitName: v.string(),
		school: v.string(),
	},
	handler: async (ctx, args) => {
		const role = await getRequesterRole({
			ctx,
			courseId: args.courseId,
			school: args.school,
		});
		assertEditorOrAdmin(role);

		const count = await ctx.db
			.query("units")
			.withIndex("by_course_id", (q) => q.eq("courseId", args.courseId))
			.collect();

		const order = count.length;
		const id = await ctx.db.insert("units", {
			school: args.school,
			courseId: args.courseId,
			name: args.unitName,
			description: args.description ?? undefined,
			isPublished: args.isPublished ?? false,
			order,
		});



		await ctx.db.insert("logs", {
			userId: (await ctx.auth.getUserIdentity())?.subject ?? "unknown",
			courseId: args.courseId,
			school: args.school,
			action: "CREATE_UNIT",
			timestamp: Date.now(),
			unitId: id,
		});

		return id;
	},
});

export const update = mutation({
	args: {
		courseId: v.id("courses"),
		data: v.object({
			id: v.id("units"),
			name: v.optional(v.string()),
			isPublished: v.optional(v.boolean()),
			description: v.optional(v.union(v.string(), v.null())),
		}),
		school: v.string(),
	},
	handler: async (ctx, args) => {
		const role = await getRequesterRole({
			ctx,
			courseId: args.courseId,
			school: args.school,
		});
		assertEditorOrAdmin(role);

		const unit = await ctx.db.get(args.data.id);
		if (!(unit && unit.courseId === args.courseId)) {
			throw new Error("Unit not found");
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
			userId: (await ctx.auth.getUserIdentity())?.subject ?? "unknown",
			courseId: args.courseId,
			unitId: args.data.id,
			action: "UPDATE_UNIT",
			school: args.school,
			timestamp: Date.now(),
		});
	},
});

export const reorder = mutation({
	args: {
		courseId: v.id("courses"),
		data: v.array(
			v.object({
				id: v.id("units"),
				position: v.number(),
			}),
		),
		school: v.string(),
	},
	handler: async (ctx, args) => {
		const role = await getRequesterRole({
			ctx,
			courseId: args.courseId,
			school: args.school,
		});
		assertEditorOrAdmin(role);

		// Update each unit order to the provided position
		for (const item of args.data) {
			const unit = await ctx.db.get(item.id);
			if (
				unit &&
				unit.courseId === args.courseId &&
				unit.order !== item.position
			) {
				await ctx.db.patch(item.id, { order: item.position });
			}
		}

		await ctx.db.insert("logs", {
			userId: (await ctx.auth.getUserIdentity())?.subject ?? "unknown",
			courseId: args.courseId,
			action: "REORDER_UNIT",
			school: args.school,
			timestamp: Date.now(),
		});
	},
});

export const remove = mutation({
	args: {
		courseId: v.id("courses"),
		id: v.id("units"),
		school: v.string(),
	},
	handler: async (ctx, args) => {
		const role = await getRequesterRole({
			ctx,
			courseId: args.courseId,
			school: args.school,
		});
		assertEditorOrAdmin(role);

		const unit = await ctx.db.get(args.id);
		if (!(unit && unit.courseId === args.courseId)) {
			throw new Error("Unit not found");
		}

		await ctx.db.delete(args.id);

		const remaining = await ctx.db
			.query("units")
			.withIndex("by_course_id", (q) => q.eq("courseId", args.courseId))
			.order("asc")
			.collect();
		for (const [index, u] of remaining.entries()) {
			if (u.order !== index) {
				await ctx.db.patch(u._id, { order: index });
			}
		}

		await ctx.db.insert("logs", {
			userId: (await ctx.auth.getUserIdentity())?.subject ?? "unknown",
			courseId: args.courseId,
			unitId: args.id,
			action: "DELETE_UNIT",
			school: args.school,
			timestamp: Date.now(),
		});
	},
});
