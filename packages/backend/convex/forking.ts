import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
	assertEditorOrAdmin,
	assertSiteAdmin,
	getRequesterRole,
} from "./permissions";

// Search for public courses across ALL schools
export const searchPublicCourses = query({
	args: {
		term: v.string(),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 10;
		const courses = await ctx.db
			.query("courses")
			.withSearchIndex("search_name", (q) =>
				q.search("name", args.term).eq("isPublic", true),
			)
			.take(limit);

		return courses;
	},
});

// Search for public units across ALL schools
// Note: We need to ensure the parent course is public
export const searchPublicUnits = query({
	args: {
		term: v.string(),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 10;
		// First search for units
		const units = await ctx.db
			.query("units")
			.withSearchIndex("search_name", (q) => q.search("name", args.term))
			.take(limit * 2); // Fetch more to filter out non-public courses

		// Filter for units in public courses
		const results = [];
		for (const unit of units) {
			if (!unit.isPublished) continue;
			const course = await ctx.db.get(unit.courseId);
			if (course?.isPublic) {
				results.push({
					...unit,
					courseName: course.name,
					courseSchool: course.school,
				});
			}
			if (results.length >= limit) break;
		}

		return results;
	},
});

// Search for public lessons across ALL schools
export const searchPublicLessons = query({
	args: {
		term: v.string(),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 10;
		const lessons = await ctx.db
			.query("lessons")
			.withSearchIndex("search_name", (q) => q.search("name", args.term))
			.take(limit * 3);

		const results = [];
		for (const lesson of lessons) {
			if (!lesson.isPublished) continue;

			const course = await ctx.db.get(lesson.courseId);
			if (!course || !course.isPublic) continue;

			const unit = await ctx.db.get(lesson.unitId);
			if (!unit || !unit.isPublished) continue;

			results.push({
				...lesson,
				courseName: course.name,
				unitName: unit.name,
				school: course.school,
			});

			if (results.length >= limit) break;
		}

		return results;
	},
});

export const forkCourse = mutation({
	args: {
		sourceCourseId: v.id("courses"),
		targetSchool: v.string(),
	},
	handler: async (ctx, args) => {
		const role = await getRequesterRole({ ctx, school: args.targetSchool });
		assertSiteAdmin(role);

		const sourceCourse = await ctx.db.get(args.sourceCourseId);
		if (!sourceCourse) throw new Error("Source course not found");
		if (!sourceCourse.isPublic) throw new Error("Cannot fork private course");

		const { _id, _creationTime, ...courseData } = sourceCourse;

		// Create course copy
		const newCourseId = await ctx.db.insert("courses", {
			...courseData,
			id: undefined, // Deprecated field
			school: args.targetSchool,
			isPublic: false, // Default to private when forked
			name: `${sourceCourse.name} (Forked)`,
		});

		// Log activity
		const user = await ctx.auth.getUserIdentity();
		if (user) {
			await ctx.db.insert("logs", {
				school: args.targetSchool,
				userId: user.subject,
				action: "CREATE_COURSE",
				courseId: newCourseId,
				timestamp: Date.now(),
			});
		}

		// Copy units
		const units = await ctx.db
			.query("units")
			.withIndex("by_course_id", (q) => q.eq("courseId", args.sourceCourseId))
			.collect();

		for (const unit of units) {
			const { _id: uId, _creationTime: uTime, ...unitData } = unit;
			const newUnitId = await ctx.db.insert("units", {
				...unitData,
				id: undefined,
				school: args.targetSchool,
				courseId: newCourseId,
			});

			// Copy lessons
			const lessons = await ctx.db
				.query("lessons")
				.withIndex("by_unit_id", (q) => q.eq("unitId", unit._id))
				.collect();

			for (const lesson of lessons) {
				const { _id: lId, _creationTime: lTime, ...lessonData } = lesson;
				const newLessonId = await ctx.db.insert("lessons", {
					...lessonData,
					id: undefined,
					school: args.targetSchool,
					courseId: newCourseId,
					unitId: newUnitId,
				});

				// Copy embeds
				const embeds = await ctx.db
					.query("lessonEmbeds")
					.withIndex("by_lesson_id", (q) => q.eq("lessonId", lesson._id))
					.collect();

				for (const embed of embeds) {
					const { _id: eId, _creationTime: eTime, ...embedData } = embed;
					await ctx.db.insert("lessonEmbeds", {
						...embedData,
						id: undefined,
						school: args.targetSchool,
						lessonId: newLessonId,
					});
				}
			}
		}

		return newCourseId;
	},
});

export const forkUnit = mutation({
	args: {
		sourceUnitId: v.id("units"),
		targetCourseId: v.id("courses"),
		targetSchool: v.string(),
	},
	handler: async (ctx, args) => {
		// Check permissions
		const role = await getRequesterRole({
			ctx,
			courseId: args.targetCourseId,
			school: args.targetSchool,
		});
		assertEditorOrAdmin(role);

		const sourceUnit = await ctx.db.get(args.sourceUnitId);
		if (!sourceUnit) throw new Error("Source unit not found");

		// Verify source is accessible (public course)
		const sourceCourse = await ctx.db.get(sourceUnit.courseId);
		if (!sourceCourse?.isPublic)
			throw new Error("Cannot fork from private course");

		// Get max order to append at end
		const existingUnits = await ctx.db
			.query("units")
			.withIndex("by_course_id", (q) => q.eq("courseId", args.targetCourseId))
			.collect();
		const order = existingUnits.length;

		const { _id, _creationTime, ...unitData } = sourceUnit;

		const newUnitId = await ctx.db.insert("units", {
			...unitData,
			id: undefined,
			school: args.targetSchool,
			courseId: args.targetCourseId,
			order,
			name: `${sourceUnit.name} (Forked)`,
		});

		// Log activity
		const user = await ctx.auth.getUserIdentity();
		if (user) {
			await ctx.db.insert("logs", {
				school: args.targetSchool,
				userId: user.subject,
				action: "CREATE_UNIT",
				courseId: args.targetCourseId,
				unitId: newUnitId,
				timestamp: Date.now(),
			});
		}

		// Copy lessons
		const lessons = await ctx.db
			.query("lessons")
			.withIndex("by_unit_id", (q) => q.eq("unitId", sourceUnit._id))
			.collect();

		for (const lesson of lessons) {
			const { _id: lId, _creationTime: lTime, ...lessonData } = lesson;
			const newLessonId = await ctx.db.insert("lessons", {
				...lessonData,
				id: undefined,
				school: args.targetSchool,
				courseId: args.targetCourseId,
				unitId: newUnitId,
			});

			const embeds = await ctx.db
				.query("lessonEmbeds")
				.withIndex("by_lesson_id", (q) => q.eq("lessonId", lesson._id))
				.collect();

			for (const embed of embeds) {
				const { _id: eId, _creationTime: eTime, ...embedData } = embed;
				await ctx.db.insert("lessonEmbeds", {
					...embedData,
					id: undefined,
					school: args.targetSchool,
					lessonId: newLessonId,
				});
			}
		}

		return newUnitId;
	},
});

export const forkLesson = mutation({
	args: {
		sourceLessonId: v.id("lessons"),
		targetUnitId: v.id("units"),
		targetCourseId: v.id("courses"),
		targetSchool: v.string(),
	},
	handler: async (ctx, args) => {
		const role = await getRequesterRole({
			ctx,
			courseId: args.targetCourseId,
			school: args.targetSchool,
		});
		assertEditorOrAdmin(role);

		const sourceLesson = await ctx.db.get(args.sourceLessonId);
		if (!sourceLesson) throw new Error("Source lesson not found");

		// Verify source is accessible
		const sourceCourse = await ctx.db.get(sourceLesson.courseId);
		if (!sourceCourse?.isPublic)
			throw new Error("Cannot fork from private course");

		// Get max order
		const existingLessons = await ctx.db
			.query("lessons")
			.withIndex("by_unit_id", (q) => q.eq("unitId", args.targetUnitId))
			.collect();
		const maxOrder = existingLessons.reduce(
			(acc, l) => Math.max(acc, l.order),
			0,
		);

		const { _id, _creationTime, ...lessonData } = sourceLesson;

		const newLessonId = await ctx.db.insert("lessons", {
			...lessonData,
			id: undefined,
			school: args.targetSchool,
			courseId: args.targetCourseId,
			unitId: args.targetUnitId,
			order: maxOrder + 1,
			name: `${sourceLesson.name} (Forked)`,
		});

		// Log activity
		const user = await ctx.auth.getUserIdentity();
		if (user) {
			await ctx.db.insert("logs", {
				school: args.targetSchool,
				userId: user.subject,
				action: "CREATE_LESSON",
				courseId: args.targetCourseId,
				unitId: args.targetUnitId,
				lessonId: newLessonId,
				timestamp: Date.now(),
			});
		}

		const embeds = await ctx.db
			.query("lessonEmbeds")
			.withIndex("by_lesson_id", (q) => q.eq("lessonId", sourceLesson._id))
			.collect();

		for (const embed of embeds) {
			const { _id: eId, _creationTime: eTime, ...embedData } = embed;
			await ctx.db.insert("lessonEmbeds", {
				...embedData,
				id: undefined,
				school: args.targetSchool,
				lessonId: newLessonId,
			});
		}

		return newLessonId;
	},
});
