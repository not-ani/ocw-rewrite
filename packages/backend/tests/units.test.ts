/**
 * Unit Integration Tests
 *
 * Tests for unit-related functionality including:
 * - Unit CRUD operations
 * - Unit reordering
 * - Permission checks
 * - Unit search
 */

import { describe, expect, it } from "vitest";
import { api } from "../convex/_generated/api";
import { createConvexTest } from "./convexTestHelper";
import {
	setupCompleteCourse,
	setupCourse,
	setupCourseUser,
	setupLesson,
	setupSiteAdmin,
	setupUnit,
} from "./setup";
import { TEST_SCHOOLS, TEST_USERS } from "./testUtils";

describe("Units", () => {
	describe("getTableData", () => {
		it("returns all units for a course", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCompleteCourse(t, TEST_SCHOOLS.PRIMARY, {
				unitCount: 3,
				lessonsPerUnit: 0,
			});

			const result = await t.query(api.units.getTableData, {
				courseId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result).toHaveLength(3);
			expect(result.every((u) => u.courseId === courseId)).toBe(true);
		});

		it("returns units in ascending order", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			// Create units in order (Convex sorts by creation time within index)
			await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY, {
				name: "Unit 1",
				order: 0,
			});
			await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY, {
				name: "Unit 2",
				order: 1,
			});
			await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY, {
				name: "Unit 3",
				order: 2,
			});

			const result = await t.query(api.units.getTableData, {
				courseId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result[0]?.name).toBe("Unit 1");
			expect(result[1]?.name).toBe("Unit 2");
			expect(result[2]?.name).toBe("Unit 3");
		});
	});

	describe("getById", () => {
		it("returns a unit by ID", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY, {
				name: "Test Unit",
			});

			const result = await t.query(api.units.getById, {
				id: unitId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result).not.toBeNull();
			expect(result?.name).toBe("Test Unit");
		});

		it("returns null for non-existent unit", async () => {
			const t = createConvexTest();

			// Create and delete a unit to get a valid but non-existent ID
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);
			await t.run(async (ctx) => {
				await ctx.db.delete(unitId);
			});

			const result = await t.query(api.units.getById, {
				id: unitId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result).toBeNull();
		});
	});

	describe("getUnitWithLessons", () => {
		it("returns unit with published lessons", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
				name: "Parent Course",
			});
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY, {
				name: "Unit With Lessons",
				isPublished: true,
			});

			// Create published and unpublished lessons
			await setupLesson(t, courseId, unitId, TEST_SCHOOLS.PRIMARY, {
				name: "Published Lesson",
				isPublished: true,
				order: 0,
			});
			await setupLesson(t, courseId, unitId, TEST_SCHOOLS.PRIMARY, {
				name: "Unpublished Lesson",
				isPublished: false,
				order: 1,
			});

			const result = await t.query(api.units.getUnitWithLessons, {
				id: unitId,
			});

			expect(result).not.toBeNull();
			expect(result?.name).toBe("Unit With Lessons");
			expect(result?.course.name).toBe("Parent Course");
			expect(result?.lessons).toHaveLength(1);
			expect(result?.lessons[0]?.name).toBe("Published Lesson");
		});

		it("returns null for non-existent unit", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);
			await t.run(async (ctx) => {
				await ctx.db.delete(unitId);
			});

			const result = await t.query(api.units.getUnitWithLessons, {
				id: unitId,
			});

			expect(result).toBeNull();
		});
	});

	describe("create", () => {
		it("creates a unit when user is site admin", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			const unitId = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.units.create, {
					courseId,
					unitName: "New Unit",
					description: "A new unit description",
					isPublished: false,
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(unitId).toBeDefined();

			// Verify the unit was created
			const unit = await t.query(api.units.getById, {
				id: unitId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(unit?.name).toBe("New Unit");
			expect(unit?.description).toBe("A new unit description");
			expect(unit?.isPublished).toBe(false);
		});

		it("creates a unit when user is course editor", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			await setupCourseUser(
				t,
				courseId,
				TEST_USERS.COURSE_EDITOR.tokenIdentifier,
				TEST_SCHOOLS.PRIMARY,
				"editor",
			);

			const unitId = await t
				.withIdentity(TEST_USERS.COURSE_EDITOR)
				.mutation(api.units.create, {
					courseId,
					unitName: "Editor Created Unit",
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(unitId).toBeDefined();
		});

		it("assigns correct order to new units", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			// Create three units
			const unitId1 = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.units.create, {
					courseId,
					unitName: "First Unit",
					school: TEST_SCHOOLS.PRIMARY,
				});

			const unitId2 = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.units.create, {
					courseId,
					unitName: "Second Unit",
					school: TEST_SCHOOLS.PRIMARY,
				});

			const unitId3 = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.units.create, {
					courseId,
					unitName: "Third Unit",
					school: TEST_SCHOOLS.PRIMARY,
				});

			// Verify orders
			const unit1 = await t.query(api.units.getById, {
				id: unitId1,
				school: TEST_SCHOOLS.PRIMARY,
			});
			const unit2 = await t.query(api.units.getById, {
				id: unitId2,
				school: TEST_SCHOOLS.PRIMARY,
			});
			const unit3 = await t.query(api.units.getById, {
				id: unitId3,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(unit1?.order).toBe(0);
			expect(unit2?.order).toBe(1);
			expect(unit3?.order).toBe(2);
		});

		it("rejects unauthorized users", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			await expect(
				t.withIdentity(TEST_USERS.REGULAR_USER).mutation(api.units.create, {
					courseId,
					unitName: "Unauthorized Unit",
					school: TEST_SCHOOLS.PRIMARY,
				}),
			).rejects.toThrow();
		});

		it("creates a log entry when creating a unit", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			await t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.units.create, {
				courseId,
				unitName: "Logged Unit",
				school: TEST_SCHOOLS.PRIMARY,
			});

			// Verify log was created
			const logs = await t.run(async (ctx) => {
				return await ctx.db
					.query("logs")
					.withIndex("by_action_and_school", (q) =>
						q.eq("action", "CREATE_UNIT").eq("school", TEST_SCHOOLS.PRIMARY),
					)
					.collect();
			});

			expect(logs).toHaveLength(1);
			expect(logs[0]?.action).toBe("CREATE_UNIT");
		});
	});

	describe("update", () => {
		it("updates a unit when user is authorized", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY, {
				name: "Original Name",
				isPublished: false,
			});

			await t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.units.update, {
				courseId,
				data: {
					id: unitId,
					name: "Updated Name",
					isPublished: true,
				},
				school: TEST_SCHOOLS.PRIMARY,
			});

			const updated = await t.query(api.units.getById, {
				id: unitId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(updated?.name).toBe("Updated Name");
			expect(updated?.isPublished).toBe(true);
		});

		it("throws error for unit not in course", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId: courseId1 } = await setupCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
			);
			const { courseId: courseId2 } = await setupCourse(
				t,
				TEST_SCHOOLS.PRIMARY,
			);
			const { unitId } = await setupUnit(t, courseId1, TEST_SCHOOLS.PRIMARY);

			await expect(
				t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.units.update, {
					courseId: courseId2, // Wrong course
					data: {
						id: unitId,
						name: "Should Fail",
					},
					school: TEST_SCHOOLS.PRIMARY,
				}),
			).rejects.toThrow("Unit not found");
		});
	});

	describe("reorder", () => {
		it("reorders units correctly", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			const { unitId: unit1 } = await setupUnit(
				t,
				courseId,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Unit 1",
					order: 0,
				},
			);
			const { unitId: unit2 } = await setupUnit(
				t,
				courseId,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Unit 2",
					order: 1,
				},
			);
			const { unitId: unit3 } = await setupUnit(
				t,
				courseId,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Unit 3",
					order: 2,
				},
			);

			// Reorder: move Unit 3 to position 0
			await t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.units.reorder, {
				courseId,
				data: [
					{ id: unit3, position: 0 },
					{ id: unit1, position: 1 },
					{ id: unit2, position: 2 },
				],
				school: TEST_SCHOOLS.PRIMARY,
			});

			const units = await t.query(api.units.getTableData, {
				courseId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			// Sort by order field to verify reordering worked
			// (production returns by creation time, so we sort here to verify order values)
			const sortedByOrder = [...units].sort((a, b) => a.order - b.order);

			expect(sortedByOrder[0]?.name).toBe("Unit 3");
			expect(sortedByOrder[1]?.name).toBe("Unit 1");
			expect(sortedByOrder[2]?.name).toBe("Unit 2");
		});

		it("creates a log entry when reordering", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY, {
				order: 0,
			});

			await t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.units.reorder, {
				courseId,
				data: [{ id: unitId, position: 0 }],
				school: TEST_SCHOOLS.PRIMARY,
			});

			const logs = await t.run(async (ctx) => {
				return await ctx.db
					.query("logs")
					.withIndex("by_action_and_school", (q) =>
						q.eq("action", "REORDER_UNIT").eq("school", TEST_SCHOOLS.PRIMARY),
					)
					.collect();
			});

			expect(logs.length).toBeGreaterThan(0);
		});
	});

	describe("remove", () => {
		it("deletes a unit and renumbers remaining units", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			const { unitId: unit1 } = await setupUnit(
				t,
				courseId,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Unit 1",
					order: 0,
				},
			);
			const { unitId: unit2 } = await setupUnit(
				t,
				courseId,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Unit 2",
					order: 1,
				},
			);
			const { unitId: unit3 } = await setupUnit(
				t,
				courseId,
				TEST_SCHOOLS.PRIMARY,
				{
					name: "Unit 3",
					order: 2,
				},
			);

			// Delete the middle unit
			await t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.units.remove, {
				courseId,
				id: unit2,
				school: TEST_SCHOOLS.PRIMARY,
			});

			const remaining = await t.query(api.units.getTableData, {
				courseId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(remaining).toHaveLength(2);
			expect(remaining[0]?.order).toBe(0);
			expect(remaining[1]?.order).toBe(1);
		});

		it("throws error when unit not in course", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId: course1 } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { courseId: course2 } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, course1, TEST_SCHOOLS.PRIMARY);

			await expect(
				t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.units.remove, {
					courseId: course2,
					id: unitId,
					school: TEST_SCHOOLS.PRIMARY,
				}),
			).rejects.toThrow("Unit not found");
		});

		it("creates a log entry when deleting", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);

			await t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.units.remove, {
				courseId,
				id: unitId,
				school: TEST_SCHOOLS.PRIMARY,
			});

			const logs = await t.run(async (ctx) => {
				return await ctx.db
					.query("logs")
					.withIndex("by_action_and_school", (q) =>
						q.eq("action", "DELETE_UNIT").eq("school", TEST_SCHOOLS.PRIMARY),
					)
					.collect();
			});

			expect(logs).toHaveLength(1);
		});
	});

	describe("searchByCourse", () => {
		it("searches units by name within a course", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY, {
				name: "Introduction to Algebra",
			});
			await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY, {
				name: "Advanced Calculus",
			});
			await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY, {
				name: "Linear Algebra",
			});

			const results = await t.query(api.units.searchByCourse, {
				courseId,
				searchTerm: "Algebra",
			});

			expect(results.length).toBeGreaterThan(0);
			expect(results.every((u) => u.name.includes("Algebra"))).toBe(true);
		});

		it("returns empty array for empty search term", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			await setupUnit(t, courseId, TEST_SCHOOLS.PRIMARY);

			const results = await t.query(api.units.searchByCourse, {
				courseId,
				searchTerm: "",
			});

			expect(results).toHaveLength(0);
		});
	});
});
