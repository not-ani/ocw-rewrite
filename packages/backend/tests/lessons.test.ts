/**
 * Lesson Integration Tests
 *
 * Tests for lesson-related functionality including:
 * - Lesson CRUD operations
 * - Embed detection and management
 * - Lesson reordering
 * - Permission checks
 */

import { describe, expect, it } from "vitest";
import { api } from "../convex/_generated/api";
import { createConvexTest } from "./convexTestHelper";
import {
	setupCourse,
	setupLesson,
	setupLessonEmbed,
	setupSiteAdmin,
	setupUnit,
} from "./setup";
import { TEST_EMBED_URLS, TEST_SCHOOLS, TEST_USERS } from "./testUtils";

describe("Lessons", () => {
	describe("getLessonById", () => {
		it("returns a lesson with its embed", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);
			const { lessonId } = await setupLesson(
				t,
				courseId,
				unitId,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Test Lesson",
				},
			);
			await setupLessonEmbed(t, lessonId, TEST_SCHOOLS.PRIMARY, {
				embedUrl: TEST_EMBED_URLS.GOOGLE_DOCS,
			});

			const result = await t.query(api.lesson.getLessonById, {
				id: lessonId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result.lesson.name).toBe("Test Lesson");
			expect(result.embed.embedUrl).toBe(TEST_EMBED_URLS.GOOGLE_DOCS);
		});

		it("throws error for non-existent lesson", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);
			const { lessonId } = await setupLesson(
				t,
				courseId,
				unitId,
				TEST_SCHOOLS.PRIMARY,
			);
			await t.run(async (ctx) => {
				await ctx.db.delete(lessonId);
			});

			await expect(
				t.query(api.lesson.getLessonById, {
					id: lessonId,
					school: TEST_SCHOOLS.PRIMARY,
				}),
			).rejects.toThrow("Lesson not found");
		});

		it("throws error when embed is missing", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);
			const { lessonId } = await setupLesson(
				t,
				courseId,
				unitId,
				TEST_SCHOOLS.PRIMARY,
			);
			// Don't create an embed

			await expect(
				t.query(api.lesson.getLessonById, {
					id: lessonId,
					school: TEST_SCHOOLS.PRIMARY,
				}),
			).rejects.toThrow("Lesson embed not found");
		});
	});

	describe("getByUnit", () => {
		it("returns lessons for a unit in order", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);

			// Create lessons in order (Convex sorts by creation time within index)
			await setupLesson(t, courseId, unitId, TEST_SCHOOLS.PRIMARY, {
				name: "Lesson 1",
				order: 0,
			});
			await setupLesson(t, courseId, unitId, TEST_SCHOOLS.PRIMARY, {
				name: "Lesson 2",
				order: 1,
			});
			await setupLesson(t, courseId, unitId, TEST_SCHOOLS.PRIMARY, {
				name: "Lesson 3",
				order: 2,
			});

			const result = await t.query(api.lesson.getByUnit, {
				unitId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result).toHaveLength(3);
			expect(result[0]?.name).toBe("Lesson 1");
			expect(result[1]?.name).toBe("Lesson 2");
			expect(result[2]?.name).toBe("Lesson 3");
		});

		it("returns empty array for unit with no lessons", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);

			const result = await t.query(api.lesson.getByUnit, {
				unitId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result).toHaveLength(0);
		});
	});

	describe("create", () => {
		it("creates a lesson with Google Docs embed", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);

			const lessonId = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.lesson.create, {
					courseId,
					unitId,
					name: "New Lesson",
					embedRaw: TEST_EMBED_URLS.GOOGLE_DOCS,
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(lessonId).toBeDefined();

			// Verify the lesson was created with correct content type
			const lesson = await t.run(async (ctx) => {
				return await ctx.db.get(lessonId);
			});

			expect(lesson?.name).toBe("New Lesson");
			expect(lesson?.contentType).toBe("google_docs");
			expect(lesson?.isPublished).toBe(false);
		});

		it("creates a lesson with YouTube embed", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);

			const lessonId = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.lesson.create, {
					courseId,
					unitId,
					name: "Video Lesson",
					embedRaw: TEST_EMBED_URLS.YOUTUBE,
					school: TEST_SCHOOLS.PRIMARY,
				});

			const lesson = await t.run(async (ctx) => {
				return await ctx.db.get(lessonId);
			});

			expect(lesson?.contentType).toBe("youtube");
		});

		it("creates a lesson with Quizlet embed", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);

			const lessonId = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.lesson.create, {
					courseId,
					unitId,
					name: "Quiz Lesson",
					embedRaw: TEST_EMBED_URLS.QUIZLET,
					school: TEST_SCHOOLS.PRIMARY,
				});

			const lesson = await t.run(async (ctx) => {
				return await ctx.db.get(lessonId);
			});

			expect(lesson?.contentType).toBe("quizlet");
		});

		it("assigns correct order to new lessons", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);

			const lesson1 = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.lesson.create, {
					courseId,
					unitId,
					name: "First Lesson",
					embedRaw: TEST_EMBED_URLS.GOOGLE_DOCS,
					school: TEST_SCHOOLS.PRIMARY,
				});

			const lesson2 = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.lesson.create, {
					courseId,
					unitId,
					name: "Second Lesson",
					embedRaw: TEST_EMBED_URLS.GOOGLE_DOCS,
					school: TEST_SCHOOLS.PRIMARY,
				});

			const l1 = await t.run(async (ctx) => ctx.db.get(lesson1));
			const l2 = await t.run(async (ctx) => ctx.db.get(lesson2));

			expect(l1?.order).toBe(0);
			expect(l2?.order).toBe(1);
		});

		it("rejects unauthorized users", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);

			await expect(
				t.withIdentity(TEST_USERS.REGULAR_USER).mutation(api.lesson.create, {
					courseId,
					unitId,
					name: "Unauthorized Lesson",
					embedRaw: TEST_EMBED_URLS.GOOGLE_DOCS,
					school: TEST_SCHOOLS.PRIMARY,
				}),
			).rejects.toThrow();
		});

		it("creates log entry when creating lesson", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);

			await t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.lesson.create, {
				courseId,
				unitId,
				name: "Logged Lesson",
				embedRaw: TEST_EMBED_URLS.GOOGLE_DOCS,
				school: TEST_SCHOOLS.PRIMARY,
			});

			const logs = await t.run(async (ctx) => {
				return await ctx.db
					.query("logs")
					.withIndex("by_action_and_school", (q) =>
						q.eq("action", "CREATE_LESSON").eq("school", TEST_SCHOOLS.PRIMARY),
					)
					.collect();
			});

			expect(logs).toHaveLength(1);
		});
	});

	describe("update", () => {
		it("updates lesson name and publish status", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);
			const { lessonId } = await setupLesson(
				t,
				courseId,
				unitId,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Original Name",
					isPublished: false,
				},
			);
			// getLessonById requires an embed
			await setupLessonEmbed(t, lessonId, TEST_SCHOOLS.PRIMARY);

			await t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.lesson.update, {
				courseId,
				data: {
					id: lessonId,
					name: "Updated Name",
					isPublished: true,
				},
				school: TEST_SCHOOLS.PRIMARY,
			});

			const updated = await t.query(api.lesson.getLessonById, {
				id: lessonId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(updated.lesson.name).toBe("Updated Name");
			expect(updated.lesson.isPublished).toBe(true);
		});

		it("updates lesson content type", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);
			const { lessonId } = await setupLesson(
				t,
				courseId,
				unitId,
				TEST_SCHOOLS.PRIMARY,
				{
					contentType: "google_docs",
				},
			);
			// getLessonById requires an embed
			await setupLessonEmbed(t, lessonId, TEST_SCHOOLS.PRIMARY);

			await t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.lesson.update, {
				courseId,
				data: {
					id: lessonId,
					contentType: "youtube",
				},
				school: TEST_SCHOOLS.PRIMARY,
			});

			const updated = await t.query(api.lesson.getLessonById, {
				id: lessonId,
				school: TEST_SCHOOLS.PRIMARY,
			});
			expect(updated.lesson.contentType).toBe("youtube");
		});

		it("allows moving lesson to different unit", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId: unit1 } = await setupUnit(
				t,
				courseId,
				TEST_SCHOOLS.PRIMARY,
			);
			const { unitId: unit2 } = await setupUnit(
				t,
				courseId,
				TEST_SCHOOLS.PRIMARY,
			);
			const { lessonId } = await setupLesson(
				t,
				courseId,
				unit1,
				TEST_SCHOOLS.PRIMARY,
			);
			// getLessonById requires an embed
			await setupLessonEmbed(t, lessonId, TEST_SCHOOLS.PRIMARY);

			await t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.lesson.update, {
				courseId,
				data: {
					id: lessonId,
					unitId: unit2,
				},
				school: TEST_SCHOOLS.PRIMARY,
			});

			const updated = await t.query(api.lesson.getLessonById, {
				id: lessonId,
				school: TEST_SCHOOLS.PRIMARY,
			});
			expect(updated.lesson.unitId).toBe(unit2);
		});

		it("throws error for non-existent lesson", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);
			const { lessonId } = await setupLesson(
				t,
				courseId,
				unitId,
				TEST_SCHOOLS.PRIMARY,
			);

			await t.run(async (ctx) => ctx.db.delete(lessonId));

			await expect(
				t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.lesson.update, {
					courseId,
					data: {
						id: lessonId,
						name: "Should Fail",
					},
					school: TEST_SCHOOLS.PRIMARY,
				}),
			).rejects.toThrow("Lesson not found");
		});
	});

	describe("reorder", () => {
		it("reorders lessons within a unit", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);

			const { lessonId: lesson1 } = await setupLesson(
				t,
				courseId,
				unitId,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Lesson 1",
					order: 0,
				},
			);
			const { lessonId: lesson2 } = await setupLesson(
				t,
				courseId,
				unitId,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Lesson 2",
					order: 1,
				},
			);
			const { lessonId: lesson3 } = await setupLesson(
				t,
				courseId,
				unitId,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Lesson 3",
					order: 2,
				},
			);

			// Reorder: move Lesson 3 to first position
			await t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.lesson.reorder, {
				courseId,
				unitId,
				data: [
					{ id: lesson3, position: 0 },
					{ id: lesson1, position: 1 },
					{ id: lesson2, position: 2 },
				],
				school: TEST_SCHOOLS.PRIMARY,
			});

			const lessons = await t.query(api.lesson.getByUnit, {
				unitId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			// Sort by order field to verify reordering worked
			// (production returns by creation time, so we sort here to verify order values)
			const sortedByOrder = [...lessons].sort((a, b) => a.order - b.order);

			expect(sortedByOrder[0]?.name).toBe("Lesson 3");
			expect(sortedByOrder[1]?.name).toBe("Lesson 1");
			expect(sortedByOrder[2]?.name).toBe("Lesson 2");
		});

		it("creates log entry when reordering", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);
			const { lessonId } = await setupLesson(
				t,
				courseId,
				unitId,
				TEST_SCHOOLS.PRIMARY,
				{
					order: 0,
				},
			);

			await t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.lesson.reorder, {
				courseId,
				unitId,
				data: [{ id: lessonId, position: 0 }],
				school: TEST_SCHOOLS.PRIMARY,
			});

			const logs = await t.run(async (ctx) => {
				return await ctx.db
					.query("logs")
					.withIndex("by_action_and_school", (q) =>
						q.eq("action", "REORDER_LESSON").eq("school", TEST_SCHOOLS.PRIMARY),
					)
					.collect();
			});

			expect(logs.length).toBeGreaterThan(0);
		});
	});

	describe("remove", () => {
		it("deletes a lesson and renumbers remaining", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);

			const { lessonId: lesson1 } = await setupLesson(
				t,
				courseId,
				unitId,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Lesson 1",
					order: 0,
				},
			);
			const { lessonId: lesson2 } = await setupLesson(
				t,
				courseId,
				unitId,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Lesson 2",
					order: 1,
				},
			);
			const { lessonId: lesson3 } = await setupLesson(
				t,
				courseId,
				unitId,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Lesson 3",
					order: 2,
				},
			);

			// Delete middle lesson
			await t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.lesson.remove, {
				courseId,
				id: lesson2,
				school: TEST_SCHOOLS.PRIMARY,
			});

			const remaining = await t.query(api.lesson.getByUnit, {
				unitId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(remaining).toHaveLength(2);
			expect(remaining[0]?.order).toBe(0);
			expect(remaining[1]?.order).toBe(1);
		});

		it("creates log entry when deleting", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);
			const { lessonId } = await setupLesson(
				t,
				courseId,
				unitId,
				TEST_SCHOOLS.PRIMARY,
			);

			await t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.lesson.remove, {
				courseId,
				id: lessonId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			const logs = await t.run(async (ctx) => {
				return await ctx.db
					.query("logs")
					.withIndex("by_action_and_school", (q) =>
						q.eq("action", "DELETE_LESSON").eq("school", TEST_SCHOOLS.PRIMARY),
					)
					.collect();
			});

			expect(logs).toHaveLength(1);
		});
	});

	describe("createOrUpdateEmbed", () => {
		it("creates new embed for lesson without one", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);
			const { lessonId } = await setupLesson(
				t,
				courseId,
				unitId,
				TEST_SCHOOLS.PRIMARY,
			);

			await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.lesson.createOrUpdateEmbed, {
					lessonId,
					raw: TEST_EMBED_URLS.YOUTUBE,
					school: TEST_SCHOOLS.PRIMARY,
				});

			const embed = await t.run(async (ctx) => {
				return await ctx.db
					.query("lessonEmbeds")
					.withIndex("by_lesson_id", (q) => q.eq("lessonId", lessonId))
					.first();
			});

			expect(embed).not.toBeNull();
			expect(embed?.embedUrl).toContain("youtube.com/embed");
		});

		it("updates existing embed", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);
			const { lessonId } = await setupLesson(
				t,
				courseId,
				unitId,
				TEST_SCHOOLS.PRIMARY,
			);
			await setupLessonEmbed(t, lessonId, TEST_SCHOOLS.PRIMARY, {
				embedUrl: TEST_EMBED_URLS.GOOGLE_DOCS,
			});

			await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.lesson.createOrUpdateEmbed, {
					lessonId,
					raw: TEST_EMBED_URLS.YOUTUBE,
					school: TEST_SCHOOLS.PRIMARY,
				});

			const embed = await t.run(async (ctx) => {
				return await ctx.db
					.query("lessonEmbeds")
					.withIndex("by_lesson_id", (q) => q.eq("lessonId", lessonId))
					.first();
			});

			expect(embed?.embedUrl).toContain("youtube.com/embed");
		});

		it("detects Google Drive file URLs", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);
			const { lessonId } = await setupLesson(
				t,
				courseId,
				unitId,
				TEST_SCHOOLS.PRIMARY,
			);

			await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.lesson.createOrUpdateEmbed, {
					lessonId,
					raw: TEST_EMBED_URLS.GOOGLE_DRIVE,
					school: TEST_SCHOOLS.PRIMARY,
				});

			const embed = await t.run(async (ctx) => {
				return await ctx.db
					.query("lessonEmbeds")
					.withIndex("by_lesson_id", (q) => q.eq("lessonId", lessonId))
					.first();
			});

			expect(embed?.embedUrl).toContain("drive.google.com");
		});

		it("throws error for unauthenticated users", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);
			const { lessonId } = await setupLesson(
				t,
				courseId,
				unitId,
				TEST_SCHOOLS.PRIMARY,
			);

			await expect(
				t.mutation(api.lesson.createOrUpdateEmbed, {
					lessonId,
					raw: TEST_EMBED_URLS.GOOGLE_DOCS,
					school: TEST_SCHOOLS.PRIMARY,
				}),
			).rejects.toThrow("Not authenticated");
		});
	});

	describe("searchByCourse", () => {
		it("searches lessons by name within a course", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY, {
				name: "Unit A",
			});

			await setupLesson(t, courseId, unitId, TEST_SCHOOLS.PRIMARY, {
				name: "Introduction to JavaScript",
			});
			await setupLesson(t, courseId, unitId, TEST_SCHOOLS.PRIMARY, {
				name: "Advanced TypeScript",
			});
			await setupLesson(t, courseId, unitId, TEST_SCHOOLS.PRIMARY, {
				name: "JavaScript Patterns",
			});

			const results = await t.query(api.lesson.searchByCourse, {
				courseId,
				searchTerm: "JavaScript",
			});

			expect(results.length).toBeGreaterThan(0);
			expect(
				results.every((l) => l.name.toLowerCase().includes("javascript")),
			).toBe(true);
		});

		it("includes unit name in results", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY, {
				name: "Test Unit Name",
			});
			await setupLesson(t, courseId, unitId, TEST_SCHOOLS.PRIMARY, {
				name: "Searchable Lesson",
			});

			const results = await t.query(api.lesson.searchByCourse, {
				courseId,
				searchTerm: "Searchable",
			});

			expect(results[0]?.unitName).toBe("Test Unit Name");
		});

		it("returns empty array for empty search term", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);
			await setupLesson(t, courseId, unitId, TEST_SCHOOLS.PRIMARY);

			const results = await t.query(api.lesson.searchByCourse, {
				courseId,
				searchTerm: "",
			});

			expect(results).toHaveLength(0);
		});
	});
});
