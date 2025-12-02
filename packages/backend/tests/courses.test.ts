/**
 * Course Integration Tests
 *
 * Tests for course-related functionality including:
 * - Course retrieval (paginated, by ID, with units/lessons)
 * - Course search across entities
 * - Dashboard data
 * - Sidebar data
 * - Breadcrumb data
 */

import { beforeEach, describe, expect, it } from "vitest";
import { api } from "../convex/_generated/api";
import { createConvexTest } from "./convexTestHelper";
import {
	setupCompleteCourse,
	setupCourse,
	setupCourseUser,
	setupLesson,
	setupLessonEmbed,
	setupSiteAdmin,
	setupUnit,
} from "./setup";
import { TEST_SCHOOLS, TEST_USERS } from "./testUtils";

describe("Courses", () => {
	describe("getPaginatedCourses", () => {
		it("returns paginated public courses for a school", async () => {
			const t = createConvexTest();

			// Setup: Create multiple courses
			await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
				name: "Course A",
				isPublic: true,
			});
			await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
				name: "Course B",
				isPublic: true,
			});
			await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
				name: "Course C",
				isPublic: false, // Not public - should not appear
			});

			// Act
			const result = await t.query(api.courses.getPaginatedCourses, {
				page: 1,
				limit: 10,
				school: TEST_SCHOOLS.PRIMARY,
			});

			// Assert
			expect(result.courses).toHaveLength(2);
			expect(result.totalCourses).toBe(2);
			expect(result.currentPage).toBe(1);
			expect(result.courses.every((c) => c.isPublic)).toBe(true);
		});

		it("correctly paginates results", async () => {
			const t = createConvexTest();

			// Setup: Create 5 public courses
			for (let i = 0; i < 5; i++) {
				await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
					name: `Course ${i}`,
					isPublic: true,
				});
			}

			// Act: Get first page with limit of 2
			const page1 = await t.query(api.courses.getPaginatedCourses, {
				page: 1,
				limit: 2,
				school: TEST_SCHOOLS.PRIMARY,
			});

			const page2 = await t.query(api.courses.getPaginatedCourses, {
				page: 2,
				limit: 2,
				school: TEST_SCHOOLS.PRIMARY,
			});

			// Assert
			expect(page1.courses).toHaveLength(2);
			expect(page1.totalPages).toBe(3);
			expect(page2.courses).toHaveLength(2);
			expect(page2.currentPage).toBe(2);
		});

		it("filters courses by school", async () => {
			const t = createConvexTest();

			// Setup: Create courses in different schools
			await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
				name: "Primary School Course",
				isPublic: true,
			});
			await setupCourse(t, TEST_SCHOOLS.SECONDARY, {
				name: "Secondary School Course",
				isPublic: true,
			});

			// Act
			const primaryResults = await t.query(api.courses.getPaginatedCourses, {
				page: 1,
				limit: 10,
				school: TEST_SCHOOLS.PRIMARY,
			});

			const secondaryResults = await t.query(api.courses.getPaginatedCourses, {
				page: 1,
				limit: 10,
				school: TEST_SCHOOLS.SECONDARY,
			});

			// Assert
			expect(primaryResults.courses).toHaveLength(1);
			expect(primaryResults.courses[0]?.name).toBe("Primary School Course");
			expect(secondaryResults.courses).toHaveLength(1);
			expect(secondaryResults.courses[0]?.name).toBe("Secondary School Course");
		});
	});

	describe("getCourseById", () => {
		it("returns a public course by ID", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
				name: "Test Course",
				isPublic: true,
			});

			const result = await t.query(api.courses.getCourseById, {
				courseId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result).not.toBeNull();
			expect(result?.name).toBe("Test Course");
		});

		it("returns null for private courses", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
				name: "Private Course",
				isPublic: false,
			});

			const result = await t.query(api.courses.getCourseById, {
				courseId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result).toBeNull();
		});

		it("returns null for courses from different schools", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
				name: "Test Course",
				isPublic: true,
			});

			// Try to access from a different school
			const result = await t.query(api.courses.getCourseById, {
				courseId,
				school: TEST_SCHOOLS.SECONDARY,
			});

			expect(result).toBeNull();
		});
	});

	describe("getCourseWithUnitsAndLessons", () => {
		it("returns course with published units and lessons", async () => {
			const t = createConvexTest();

			const { courseId, units } = await setupCompleteCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
				{
					isPublic: true,
					unitCount: 2,
					lessonsPerUnit: 3,
					publishUnits: true,
					publishLessons: true,
				},
			);

			const result = await t.query(api.courses.getCourseWithUnitsAndLessons, {
				id: courseId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result).not.toBeNull();
			expect(result?.units).toHaveLength(2);
			expect(result?.units[0]?.lessons).toHaveLength(3);
		});

		it("excludes unpublished units and lessons", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
				isPublic: true,
			});

			// Create one published and one unpublished unit
			const { unitId: publishedUnit } = await setupUnit(
				t,
				courseId,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Published Unit",
					isPublished: true,
				},
			);

			await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY, {
				name: "Unpublished Unit",
				isPublished: false,
			});

			// Create lessons - one published, one unpublished
			await setupLesson(t, courseId, publishedUnit, TEST_SCHOOLS.PRIMARY, {
				name: "Published Lesson",
				isPublished: true,
			});

			await setupLesson(t, courseId, publishedUnit, TEST_SCHOOLS.PRIMARY, {
				name: "Unpublished Lesson",
				isPublished: false,
			});

			const result = await t.query(api.courses.getCourseWithUnitsAndLessons, {
				id: courseId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result?.units).toHaveLength(1);
			expect(result?.units[0]?.lessons).toHaveLength(1);
			expect(result?.units[0]?.name).toBe("Published Unit");
			expect(result?.units[0]?.lessons[0]?.name).toBe("Published Lesson");
		});

		it("returns null for non-existent course", async () => {
			const t = createConvexTest();

			// Create a course to get a valid ID format, then delete it
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			await t.run(async (ctx) => {
				await ctx.db.delete(courseId);
			});

			const result = await t.query(api.courses.getCourseWithUnitsAndLessons, {
				id: courseId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result).toBeNull();
		});
	});

	describe("searchEntities", () => {
		it("searches across courses, units, and lessons", async () => {
			const t = createConvexTest();

			await setupCompleteCourse(t, TEST_SCHOOLS.PRIMARY, {
				isPublic: true,
				publishUnits: true,
				publishLessons: true,
			});

			// Search for "Unit" which should match unit names
			const result = await t.query(api.courses.searchEntities, {
				term: "Unit",
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result.length).toBeGreaterThan(0);
		});

		it("returns empty array for empty search term", async () => {
			const t = createConvexTest();

			await setupCompleteCourse(t, TEST_SCHOOLS.PRIMARY, {
				isPublic: true,
			});

			const result = await t.query(api.courses.searchEntities, {
				term: "",
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result).toHaveLength(0);
		});

		it("filters by include parameter", async () => {
			const t = createConvexTest();

			await setupCompleteCourse(t, TEST_SCHOOLS.PRIMARY, {
				isPublic: true,
				publishUnits: true,
				publishLessons: true,
			});

			// Search only for courses
			const coursesOnly = await t.query(api.courses.searchEntities, {
				term: "Complete",
				include: ["course"],
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(coursesOnly.every((r) => r.type === "course")).toBe(true);
		});
	});

	describe("getDashboardSummary", () => {
		it("returns dashboard data for authorized users", async () => {
			const t = createConvexTest();

			// Setup site admin
			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);

			const { courseId } = await setupCompleteCourse(t, TEST_SCHOOLS.PRIMARY, {
				unitCount: 3,
				lessonsPerUnit: 2,
				publishUnits: true,
				publishLessons: true,
			});

			const result = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.query(api.courses.getDashboardSummary, {
					courseId,
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result.course.name).toBe("Complete Test Course");
			expect(result.counts.units).toBe(3);
			expect(result.counts.lessons).toBe(6);
			expect(result.counts.publishedUnits).toBe(3);
			expect(result.counts.publishedLessons).toBe(6);
		});

		it("throws for unauthorized users", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			// Regular user without course membership or site admin
			await expect(
				t
					.withIdentity(TEST_USERS.REGULAR_USER)
					.query(api.courses.getDashboardSummary, {
						courseId,
						school: TEST_SCHOOLS.PRIMARY,
					}),
			).rejects.toThrow();
		});

		it("allows course editors to access dashboard", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			// Setup course editor membership
			await setupCourseUser(
				t,
				courseId,
				TEST_USERS.COURSE_EDITOR.tokenIdentifier,
				TEST_SCHOOLS.PRIMARY,
				"editor",
			);

			const result = await t
				.withIdentity(TEST_USERS.COURSE_EDITOR)
				.query(api.courses.getDashboardSummary, {
					courseId,
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result).toBeDefined();
			expect(result.course).toBeDefined();
		});
	});

	describe("getSidebarData", () => {
		it("returns sidebar data with units and lessons", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCompleteCourse(t, TEST_SCHOOLS.PRIMARY, {
				isPublic: true,
				unitCount: 2,
				lessonsPerUnit: 2,
				publishUnits: true,
				publishLessons: true,
			});

			const result = await t.query(api.courses.getSidebarData, {
				courseId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result).toHaveLength(2);
			expect(result[0]?.lessons).toHaveLength(2);
			expect(result[0]?.course.name).toBe("Complete Test Course");
		});

		it("includes embed data for lessons", async () => {
			const t = createConvexTest();

			const { courseId, units } = await setupCompleteCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
				{
					isPublic: true,
					unitCount: 1,
					lessonsPerUnit: 1,
					publishUnits: true,
					publishLessons: true,
				},
			);

			const result = await t.query(api.courses.getSidebarData, {
				courseId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result[0]?.lessons[0]?.embeds).toBeDefined();
		});
	});

	describe("getBreadcrumbData", () => {
		it("returns breadcrumb data for course only", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
				name: "Breadcrumb Test Course",
			});

			const result = await t.query(api.courses.getBreadcrumbData, {
				courseId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result?.course.name).toBe("Breadcrumb Test Course");
			expect(result?.unit).toBeUndefined();
			expect(result?.lesson).toBeUndefined();
		});

		it("returns breadcrumb data with unit and lesson", async () => {
			const t = createConvexTest();

			const { courseId, units } = await setupCompleteCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
			);

			const unitId = units[0]?.unitId;
			const lessonId = units[0]?.lessons[0]?.lessonId;

			const result = await t.query(api.courses.getBreadcrumbData, {
				courseId,
				unitId,
				lessonId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result?.course).toBeDefined();
			expect(result?.unit).toBeDefined();
			expect(result?.lesson).toBeDefined();
		});

		it("returns null for courses from different schools", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			const result = await t.query(api.courses.getBreadcrumbData, {
				courseId,
				school: TEST_SCHOOLS.SECONDARY,
			});

			expect(result).toBeNull();
		});
	});
});
