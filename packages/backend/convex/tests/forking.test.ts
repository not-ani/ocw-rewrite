/**
 * Forking Functionality Integration Tests
 *
 * Tests for forking courses, units, and lessons between schools:
 * - Course forking (full copy with units and lessons)
 * - Unit forking (copy to another course)
 * - Lesson forking (copy to another unit)
 * - Permission checks for forking
 */

import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { createConvexTest } from "./convexTestHelper";
import {
	setupCompleteCourse,
	setupCourse,
	setupCourseUser,
	setupSiteAdmin,
	setupUnit,
	setupLesson,
	setupLessonEmbed,
} from "./setup";
import { TEST_SCHOOLS, TEST_USERS } from "./testUtils";

describe("Forking", () => {
	describe("searchPublicCourses", () => {
		it("searches only public courses across all schools", async () => {
			const t = createConvexTest();

			await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
				name: "Public Math Course",
				isPublic: true,
			});
			await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
				name: "Private Math Course",
				isPublic: false,
			});
			await setupCourse(t, TEST_SCHOOLS.SECONDARY, {
				name: "Public Science Course",
				isPublic: true,
			});

			const results = await t.query(api.forking.searchPublicCourses, {
				term: "Course",
			});

			expect(results.length).toBeGreaterThan(0);
			expect(results.every((c) => c.isPublic)).toBe(true);
		});

		it("respects limit parameter", async () => {
			const t = createConvexTest();

			for (let i = 0; i < 5; i++) {
				await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
					name: `Course ${i}`,
					isPublic: true,
				});
			}

			const results = await t.query(api.forking.searchPublicCourses, {
				term: "Course",
				limit: 2,
			});

			expect(results.length).toBeLessThanOrEqual(2);
		});
	});

	describe("searchPublicUnits", () => {
		it("searches published units from public courses", async () => {
			const t = createConvexTest();

			const { courseId: publicCourse } = await setupCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Public Course",
					isPublic: true,
				},
			);

			await setupUnit(t, publicCourse, TEST_SCHOOLS.PRIMARY, {
				name: "Published Unit",
				isPublished: true,
			});

			await setupUnit(t, publicCourse, TEST_SCHOOLS.PRIMARY, {
				name: "Unpublished Unit",
				isPublished: false,
			});

			const { courseId: privateCourse } = await setupCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Private Course",
					isPublic: false,
				},
			);

			await setupUnit(t, privateCourse, TEST_SCHOOLS.PRIMARY, {
				name: "Private Course Unit",
				isPublished: true,
			});

			const results = await t.query(api.forking.searchPublicUnits, {
				term: "Unit",
			});

			// Should only return published units from public courses
			expect(results.length).toBe(1);
			expect(results[0].name).toBe("Published Unit");
			expect(results[0].courseName).toBe("Public Course");
		});
	});

	describe("searchPublicLessons", () => {
		it("searches published lessons from public courses and published units", async () => {
			const t = createConvexTest();

			// Setup public course with published unit and lesson
			const { courseId: publicCourse } = await setupCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Public Course",
					isPublic: true,
				},
			);

			const { unitId: publishedUnit } = await setupUnit(
				t,
				publicCourse,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Published Unit",
					isPublished: true,
				},
			);

			await setupLesson(t, publicCourse, publishedUnit, TEST_SCHOOLS.PRIMARY, {
				name: "Searchable Lesson",
				isPublished: true,
			});

			// Setup unpublished lesson
			await setupLesson(t, publicCourse, publishedUnit, TEST_SCHOOLS.PRIMARY, {
				name: "Unpublished Lesson",
				isPublished: false,
			});

			const results = await t.query(api.forking.searchPublicLessons, {
				term: "Lesson",
			});

			expect(results.length).toBe(1);
			expect(results[0].name).toBe("Searchable Lesson");
		});
	});

	describe("forkCourse", () => {
		it("forks a public course to another school", async () => {
			const t = createConvexTest();

			// Setup source course in primary school
			const { courseId: sourceCourse, units } = await setupCompleteCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
				{
					isPublic: true,
					unitCount: 2,
					lessonsPerUnit: 2,
				},
			);

			// Setup site admin in target school
			await setupSiteAdmin(t, TEST_SCHOOLS.SECONDARY);

			// Fork the course
			const forkedCourseId = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.forking.forkCourse, {
					sourceCourseId: sourceCourse,
					targetSchool: TEST_SCHOOLS.SECONDARY,
				});

			expect(forkedCourseId).toBeDefined();

			// Verify forked course properties
			const forkedCourse = await t.run(async (ctx) => {
				return await ctx.db.get(forkedCourseId);
			});

			expect(forkedCourse?.school).toBe(TEST_SCHOOLS.SECONDARY);
			expect(forkedCourse?.isPublic).toBe(false); // Forked courses start as private
			expect(forkedCourse?.name).toContain("(Forked)");

			// Verify units were forked
			const forkedUnits = await t.run(async (ctx) => {
				return await ctx.db
					.query("units")
					.withIndex("by_course_id", (q) => q.eq("courseId", forkedCourseId))
					.collect();
			});

			expect(forkedUnits).toHaveLength(2);
			expect(forkedUnits.every((u) => u.school === TEST_SCHOOLS.SECONDARY)).toBe(
				true,
			);

			// Verify lessons were forked
			const forkedLessons = await t.run(async (ctx) => {
				return await ctx.db
					.query("lessons")
					.withIndex("by_course_id", (q) => q.eq("courseId", forkedCourseId))
					.collect();
			});

			expect(forkedLessons).toHaveLength(4);
		});

		it("prevents forking private courses", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
				isPublic: false,
			});

			await setupSiteAdmin(t, TEST_SCHOOLS.SECONDARY);

			await expect(
				t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.forking.forkCourse, {
					sourceCourseId: courseId,
					targetSchool: TEST_SCHOOLS.SECONDARY,
				}),
			).rejects.toThrow("Cannot fork private course");
		});

		it("requires site admin permissions", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
				isPublic: true,
			});

			await expect(
				t.withIdentity(TEST_USERS.REGULAR_USER).mutation(api.forking.forkCourse, {
					sourceCourseId: courseId,
					targetSchool: TEST_SCHOOLS.SECONDARY,
				}),
			).rejects.toThrow();
		});

		it("creates a log entry when forking", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
				isPublic: true,
			});

			await setupSiteAdmin(t, TEST_SCHOOLS.SECONDARY);

			await t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.forking.forkCourse, {
				sourceCourseId: courseId,
				targetSchool: TEST_SCHOOLS.SECONDARY,
			});

			const logs = await t.run(async (ctx) => {
				return await ctx.db
					.query("logs")
					.withIndex("by_action_and_school", (q) =>
						q.eq("action", "CREATE_COURSE").eq("school", TEST_SCHOOLS.SECONDARY),
					)
					.collect();
			});

			expect(logs.length).toBeGreaterThan(0);
		});
	});

	describe("forkUnit", () => {
		it("forks a unit to another course in the same school", async () => {
			const t = createConvexTest();

			// Setup source course with units
			const { courseId: sourceCourse } = await setupCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
				{
					isPublic: true,
				},
			);

			const { unitId: sourceUnit } = await setupUnit(
				t,
				sourceCourse,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Unit to Fork",
					isPublished: true,
				},
			);

			await setupLesson(t, sourceCourse, sourceUnit, TEST_SCHOOLS.PRIMARY, {
				name: "Lesson in Unit",
				isPublished: true,
			});

			// Setup target course and admin
			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId: targetCourse } = await setupCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
			);

			// Fork the unit
			const forkedUnitId = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.forking.forkUnit, {
					sourceUnitId: sourceUnit,
					targetCourseId: targetCourse,
					targetSchool: TEST_SCHOOLS.PRIMARY,
				});

			expect(forkedUnitId).toBeDefined();

			// Verify forked unit
			const forkedUnit = await t.run(async (ctx) => {
				return await ctx.db.get(forkedUnitId);
			});

			expect(forkedUnit?.courseId).toBe(targetCourse);
			expect(forkedUnit?.name).toContain("(Forked)");

			// Verify lessons were forked
			const forkedLessons = await t.run(async (ctx) => {
				return await ctx.db
					.query("lessons")
					.withIndex("by_unit_id", (q) => q.eq("unitId", forkedUnitId))
					.collect();
			});

			expect(forkedLessons).toHaveLength(1);
		});

		it("assigns correct order to forked unit", async () => {
			const t = createConvexTest();

			const { courseId: sourceCourse } = await setupCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
				{
					isPublic: true,
				},
			);

			const { unitId: sourceUnit } = await setupUnit(
				t,
				sourceCourse,
				TEST_SCHOOLS.PRIMARY,
				{
					isPublished: true,
				},
			);

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId: targetCourse } = await setupCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
			);

			// Create existing units in target course
			await setupUnit(t, targetCourse, TEST_SCHOOLS.PRIMARY, { order: 0 });
			await setupUnit(t, targetCourse, TEST_SCHOOLS.PRIMARY, { order: 1 });

			// Fork unit
			const forkedUnitId = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.forking.forkUnit, {
					sourceUnitId: sourceUnit,
					targetCourseId: targetCourse,
					targetSchool: TEST_SCHOOLS.PRIMARY,
				});

			const forkedUnit = await t.run(async (ctx) => {
				return await ctx.db.get(forkedUnitId);
			});

			expect(forkedUnit?.order).toBe(2); // Should be appended at the end
		});

		it("prevents forking from private courses", async () => {
			const t = createConvexTest();

			const { courseId: privateCourse } = await setupCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
				{
					isPublic: false,
				},
			);

			const { unitId: sourceUnit } = await setupUnit(
				t,
				privateCourse,
				TEST_SCHOOLS.PRIMARY,
			);

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId: targetCourse } = await setupCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
			);

			await expect(
				t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.forking.forkUnit, {
					sourceUnitId: sourceUnit,
					targetCourseId: targetCourse,
					targetSchool: TEST_SCHOOLS.PRIMARY,
				}),
			).rejects.toThrow("Cannot fork from private course");
		});

		it("requires editor or admin role on target course", async () => {
			const t = createConvexTest();

			const { courseId: sourceCourse } = await setupCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
				{
					isPublic: true,
				},
			);

			const { unitId: sourceUnit } = await setupUnit(
				t,
				sourceCourse,
				TEST_SCHOOLS.PRIMARY,
			);

			const { courseId: targetCourse } = await setupCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
			);

			// User has "user" role, not editor or admin
			await setupCourseUser(
				t,
				targetCourse,
				TEST_USERS.REGULAR_USER.tokenIdentifier,
				TEST_SCHOOLS.PRIMARY,
				"user",
			);

			await expect(
				t.withIdentity(TEST_USERS.REGULAR_USER).mutation(api.forking.forkUnit, {
					sourceUnitId: sourceUnit,
					targetCourseId: targetCourse,
					targetSchool: TEST_SCHOOLS.PRIMARY,
				}),
			).rejects.toThrow();
		});
	});

	describe("forkLesson", () => {
		it("forks a lesson to another unit", async () => {
			const t = createConvexTest();

			// Setup source
			const { courseId: sourceCourse } = await setupCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
				{
					isPublic: true,
				},
			);

			const { unitId: sourceUnit } = await setupUnit(
				t,
				sourceCourse,
				TEST_SCHOOLS.PRIMARY,
			);

			const { lessonId: sourceLesson } = await setupLesson(
				t,
				sourceCourse,
				sourceUnit,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Lesson to Fork",
					contentType: "google_docs",
				},
			);

			await setupLessonEmbed(t, sourceLesson, TEST_SCHOOLS.PRIMARY, {
				embedUrl: "https://docs.google.com/document/d/test",
			});

			// Setup target
			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId: targetCourse } = await setupCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
			);
			const { unitId: targetUnit } = await setupUnit(
				t,
				targetCourse,
				TEST_SCHOOLS.PRIMARY,
			);

			// Fork lesson
			const forkedLessonId = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.forking.forkLesson, {
					sourceLessonId: sourceLesson,
					targetUnitId: targetUnit,
					targetCourseId: targetCourse,
					targetSchool: TEST_SCHOOLS.PRIMARY,
				});

			expect(forkedLessonId).toBeDefined();

			// Verify forked lesson
			const forkedLesson = await t.run(async (ctx) => {
				return await ctx.db.get(forkedLessonId);
			});

			expect(forkedLesson?.unitId).toBe(targetUnit);
			expect(forkedLesson?.name).toContain("(Forked)");
			expect(forkedLesson?.contentType).toBe("google_docs");

			// Verify embed was forked
			const forkedEmbed = await t.run(async (ctx) => {
				return await ctx.db
					.query("lessonEmbeds")
					.withIndex("by_lesson_id", (q) => q.eq("lessonId", forkedLessonId))
					.first();
			});

			expect(forkedEmbed).not.toBeNull();
			expect(forkedEmbed?.embedUrl).toContain("docs.google.com");
		});

		it("assigns correct order to forked lesson", async () => {
			const t = createConvexTest();

			const { courseId: sourceCourse } = await setupCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
				{
					isPublic: true,
				},
			);
			const { unitId: sourceUnit } = await setupUnit(
				t,
				sourceCourse,
				TEST_SCHOOLS.PRIMARY,
			);
			const { lessonId: sourceLesson } = await setupLesson(
				t,
				sourceCourse,
				sourceUnit,
				TEST_SCHOOLS.PRIMARY,
			);

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId: targetCourse } = await setupCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
			);
			const { unitId: targetUnit } = await setupUnit(
				t,
				targetCourse,
				TEST_SCHOOLS.PRIMARY,
			);

			// Create existing lessons
			await setupLesson(t, targetCourse, targetUnit, TEST_SCHOOLS.PRIMARY, {
				order: 0,
			});
			await setupLesson(t, targetCourse, targetUnit, TEST_SCHOOLS.PRIMARY, {
				order: 1,
			});

			// Fork lesson
			const forkedLessonId = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.forking.forkLesson, {
					sourceLessonId: sourceLesson,
					targetUnitId: targetUnit,
					targetCourseId: targetCourse,
					targetSchool: TEST_SCHOOLS.PRIMARY,
				});

			const forkedLesson = await t.run(async (ctx) => {
				return await ctx.db.get(forkedLessonId);
			});

			expect(forkedLesson?.order).toBe(2); // Should be appended
		});

		it("prevents forking from private courses", async () => {
			const t = createConvexTest();

			const { courseId: privateCourse } = await setupCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
				{
					isPublic: false,
				},
			);
			const { unitId: sourceUnit } = await setupUnit(
				t,
				privateCourse,
				TEST_SCHOOLS.PRIMARY,
			);
			const { lessonId: sourceLesson } = await setupLesson(
				t,
				privateCourse,
				sourceUnit,
				TEST_SCHOOLS.PRIMARY,
			);

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId: targetCourse } = await setupCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
			);
			const { unitId: targetUnit } = await setupUnit(
				t,
				targetCourse,
				TEST_SCHOOLS.PRIMARY,
			);

			await expect(
				t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.forking.forkLesson, {
					sourceLessonId: sourceLesson,
					targetUnitId: targetUnit,
					targetCourseId: targetCourse,
					targetSchool: TEST_SCHOOLS.PRIMARY,
				}),
			).rejects.toThrow("Cannot fork from private course");
		});
	});
});

