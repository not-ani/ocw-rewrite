import { v } from "convex/values";

import { query } from "./_generated/server";

/** A single public projection for sitemap generation (no per-course queries). */
export const getPublicSitemapData = query({
	args: { school: v.string() },
	handler: async (ctx, { school }) => {
		const [courses, units, lessons] = await Promise.all([
			ctx.db
				.query("courses")
				.withIndex("by_is_public_and_school", (q) =>
					q.eq("isPublic", true).eq("school", school),
				)
				.collect(),
			ctx.db
				.query("units")
				.withIndex("by_is_published_and_school", (q) =>
					q.eq("isPublished", true).eq("school", school),
				)
				.collect(),
			ctx.db
				.query("lessons")
				.withIndex("by_is_published_and_school", (q) =>
					q.eq("isPublished", true).eq("school", school),
				)
				.collect(),
		]);

		const publicCourseIds = new Set(courses.map((course) => course._id));
		const publicUnits = units.filter((unit) =>
			publicCourseIds.has(unit.courseId),
		);
		const publicUnitIds = new Set(publicUnits.map((unit) => unit._id));

		return {
			courses: courses.map((course) => ({
				id: course._id,
				updatedAt: course._creationTime,
			})),
			units: publicUnits.map((unit) => ({
				id: unit._id,
				courseId: unit.courseId,
				updatedAt: unit._creationTime,
			})),
			lessons: lessons
				.filter(
					(lesson) =>
						publicCourseIds.has(lesson.courseId) &&
						publicUnitIds.has(lesson.unitId),
				)
				.map((lesson) => ({
					id: lesson._id,
					courseId: lesson.courseId,
					unitId: lesson.unitId,
					updatedAt: lesson._creationTime,
				})),
		};
	},
});
