/**
 * Permission and Authorization Integration Tests
 *
 * Tests for the permission system including:
 * - Role-based access control
 * - Site admin privileges
 * - Course-level permissions
 * - Course user management
 */

import { describe, expect, it } from "vitest";
import { api } from "../convex/_generated/api";
import { createConvexTest } from "./convexTestHelper";
import {
	setupCourse,
	setupCourseUser,
	setupSiteAdmin,
	setupUnit,
} from "./setup";
import { TEST_SCHOOLS, TEST_USERS, createMockClerkIdentity } from "./testUtils";

describe("Permissions", () => {
	describe("getRequesterRole (via getDashboardSummary)", () => {
		it("site admin has full access to all courses", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			// Site admin should be able to access dashboard without course membership
			const result = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.query(api.courses.getDashboardSummary, {
					courseId,
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result).toBeDefined();
			expect(result.course).toBeDefined();
		});

		it("course admin can access their course", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			await setupCourseUser(
				t,
				courseId,
				TEST_USERS.COURSE_ADMIN.tokenIdentifier,
				TEST_SCHOOLS.PRIMARY,
				"admin",
			);

			const result = await t
				.withIdentity(TEST_USERS.COURSE_ADMIN)
				.query(api.courses.getDashboardSummary, {
					courseId,
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result).toBeDefined();
		});

		it("course editor can access their course", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
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
		});

		it("regular user cannot access course dashboard", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			await setupCourseUser(
				t,
				courseId,
				TEST_USERS.REGULAR_USER.tokenIdentifier,
				TEST_SCHOOLS.PRIMARY,
				"user", // User role, not editor or admin
			);

			await expect(
				t.withIdentity(TEST_USERS.REGULAR_USER).query(api.courses.getDashboardSummary, {
					courseId,
					school: TEST_SCHOOLS.PRIMARY,
				}),
			).rejects.toThrow("Not authorized");
		});

		it("unauthenticated user cannot access course dashboard", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			await expect(
				t.query(api.courses.getDashboardSummary, {
					courseId,
					school: TEST_SCHOOLS.PRIMARY,
				}),
			).rejects.toThrow();
		});

		it("user cannot access courses in different school", async () => {
			const t = createConvexTest();

			// Setup admin in primary school
			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.SECONDARY);

			// Try to access secondary school course as primary school admin
			await expect(
				t.withIdentity(TEST_USERS.SITE_ADMIN).query(api.courses.getDashboardSummary, {
					courseId,
					school: TEST_SCHOOLS.SECONDARY,
				}),
			).rejects.toThrow();
		});
	});

	describe("getSiteUser", () => {
		it("returns site user for authenticated admin", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);

			const result = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.query(api.permissions.getSiteUser, {
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result).not.toBeNull();
			expect(result?.role).toBe("admin");
		});

		it("returns null for non-admin user", async () => {
			const t = createConvexTest();

			const result = await t
				.withIdentity(TEST_USERS.REGULAR_USER)
				.query(api.permissions.getSiteUser, {
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result).toBeNull();
		});

		it("returns null for unauthenticated user", async () => {
			const t = createConvexTest();

			const result = await t.query(api.permissions.getSiteUser, {
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result).toBeNull();
		});
	});
});

describe("Course Users", () => {
	describe("getMyMembership", () => {
		it("returns membership for course admin", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			await setupCourseUser(
				t,
				courseId,
				TEST_USERS.COURSE_ADMIN.tokenIdentifier,
				TEST_SCHOOLS.PRIMARY,
				"admin",
				[
					"create_unit",
					"edit_unit",
					"delete_unit",
					"create_lesson",
					"manage_users",
				],
			);

			const result = await t
				.withIdentity(TEST_USERS.COURSE_ADMIN)
				.query(api.courseUsers.getMyMembership, {
					courseId,
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result?.role).toBe("admin");
			expect(result?.permissions).toContain("create_unit");
			expect(result?.permissions).toContain("manage_users");
		});

		it("returns full permissions for site admin", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			const result = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.query(api.courseUsers.getMyMembership, {
					courseId,
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result?.role).toBe("admin");
			expect(result?.permissions).toContain("manage_course");
			expect(result?.permissions).toContain("manage_users");
		});

		it("returns null for non-member", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			const result = await t
				.withIdentity(TEST_USERS.REGULAR_USER)
				.query(api.courseUsers.getMyMembership, {
					courseId,
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result).toBeNull();
		});
	});

	describe("countMembersByRole", () => {
		it("counts members by role", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			// Add different role members
			await setupCourseUser(
				t,
				courseId,
				createMockClerkIdentity("admin1").tokenIdentifier,
				TEST_SCHOOLS.PRIMARY,
				"admin",
			);
			await setupCourseUser(
				t,
				courseId,
				createMockClerkIdentity("editor1").tokenIdentifier,
				TEST_SCHOOLS.PRIMARY,
				"editor",
			);
			await setupCourseUser(
				t,
				courseId,
				createMockClerkIdentity("editor2").tokenIdentifier,
				TEST_SCHOOLS.PRIMARY,
				"editor",
			);
			await setupCourseUser(
				t,
				courseId,
				createMockClerkIdentity("user1").tokenIdentifier,
				TEST_SCHOOLS.PRIMARY,
				"user",
			);

			const result = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.query(api.courseUsers.countMembersByRole, {
					courseId,
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result.admin).toBe(1);
			expect(result.editor).toBe(2);
			expect(result.user).toBe(1);
		});

		it("rejects unauthorized users", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			await expect(
				t.withIdentity(TEST_USERS.REGULAR_USER).query(api.courseUsers.countMembersByRole, {
					courseId,
					school: TEST_SCHOOLS.PRIMARY,
				}),
			).rejects.toThrow();
		});
	});

	describe("listMembers", () => {
		it("lists all members of a course", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			await setupCourseUser(
				t,
				courseId,
				createMockClerkIdentity("member1").tokenIdentifier,
				TEST_SCHOOLS.PRIMARY,
				"editor",
			);
			await setupCourseUser(
				t,
				courseId,
				createMockClerkIdentity("member2").tokenIdentifier,
				TEST_SCHOOLS.PRIMARY,
				"user",
			);

			const result = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.query(api.courseUsers.listMembers, {
					courseId,
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result).toHaveLength(2);
			expect(result.some((m) => m.role === "editor")).toBe(true);
			expect(result.some((m) => m.role === "user")).toBe(true);
		});
	});

	describe("addOrUpdateMember", () => {
		it("adds a new member to a course", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			const newUserId = createMockClerkIdentity("new-member").tokenIdentifier;

			const result = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.courseUsers.addOrUpdateMember, {
					courseId,
					userId: newUserId,
					role: "editor",
					permissions: ["create_unit", "edit_unit"],
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result.created).toBe(true);
			expect(result.updated).toBe(false);

			// Verify the member was added
			const members = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.query(api.courseUsers.listMembers, {
					courseId,
					school: TEST_SCHOOLS.PRIMARY,
				});

			const newMember = members.find((m) => m.userId === newUserId);
			expect(newMember).toBeDefined();
			expect(newMember?.role).toBe("editor");
			expect(newMember?.permissions).toContain("create_unit");
		});

		it("updates existing member role and permissions", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const existingUserId = createMockClerkIdentity("existing").tokenIdentifier;

			await setupCourseUser(
				t,
				courseId,
				existingUserId,
				TEST_SCHOOLS.PRIMARY,
				"user",
			);

			const result = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.courseUsers.addOrUpdateMember, {
					courseId,
					userId: existingUserId,
					role: "admin",
					permissions: ["manage_users", "manage_course"],
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result.updated).toBe(true);
			expect(result.created).toBe(false);

			// Verify the update
			const members = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.query(api.courseUsers.listMembers, {
					courseId,
					school: TEST_SCHOOLS.PRIMARY,
				});

			const updatedMember = members.find((m) => m.userId === existingUserId);
			expect(updatedMember?.role).toBe("admin");
		});

		it("rejects unauthorized users", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			await expect(
				t.withIdentity(TEST_USERS.REGULAR_USER).mutation(api.courseUsers.addOrUpdateMember, {
					courseId,
					userId: "some-user",
					role: "editor",
					school: TEST_SCHOOLS.PRIMARY,
				}),
			).rejects.toThrow();
		});
	});

	describe("removeMember", () => {
		it("removes a member from a course", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			const userToRemove = createMockClerkIdentity("to-remove").tokenIdentifier;

			await setupCourseUser(
				t,
				courseId,
				userToRemove,
				TEST_SCHOOLS.PRIMARY,
				"editor",
			);

			const result = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.courseUsers.removeMember, {
					courseId,
					userId: userToRemove,
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result.removed).toBe(true);

			// Verify removal
			const members = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.query(api.courseUsers.listMembers, {
					courseId,
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(members.find((m) => m.userId === userToRemove)).toBeUndefined();
		});

		it("returns false when member not found", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			const result = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.courseUsers.removeMember, {
					courseId,
					userId: "non-existent-user",
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result.removed).toBe(false);
		});
	});

	describe("getTokenId", () => {
		it("returns token identifier for authenticated user", async () => {
			const t = createConvexTest();

			const result = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.query(api.courseUsers.getTokenId, {});

			expect(result.token).toBe(TEST_USERS.SITE_ADMIN.tokenIdentifier);
		});

		it("returns undefined for unauthenticated user", async () => {
			const t = createConvexTest();

			const result = await t.query(api.courseUsers.getTokenId, {});

			expect(result.token).toBeUndefined();
		});
	});
});

describe("Permission Enforcement", () => {
	describe("Unit mutations require authorization", () => {
		it("site admin can create units in any course", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			const unitId = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.units.create, {
					courseId,
					unitName: "Admin Created Unit",
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(unitId).toBeDefined();
		});

		it("course editor can create units", async () => {
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

		it("regular user cannot create units", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);
			await setupCourseUser(
				t,
				courseId,
				TEST_USERS.REGULAR_USER.tokenIdentifier,
				TEST_SCHOOLS.PRIMARY,
				"user",
			);

			await expect(
				t.withIdentity(TEST_USERS.REGULAR_USER).mutation(api.units.create, {
					courseId,
					unitName: "Should Fail",
					school: TEST_SCHOOLS.PRIMARY,
				}),
			).rejects.toThrow("Not authorized");
		});
	});

	describe("Cross-school access is blocked", () => {
		it("site admin in one school cannot modify courses in another", async () => {
			const t = createConvexTest();

			// Setup admin in primary school
			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);

			// Create course in secondary school
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.SECONDARY);
			const { unitId } = await setupUnit(t, courseId, TEST_SCHOOLS.SECONDARY);

			// Attempt to modify secondary school course as primary school admin
			await expect(
				t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.units.update, {
					courseId,
					data: {
						id: unitId,
						name: "Should Not Work",
					},
					school: TEST_SCHOOLS.SECONDARY,
				}),
			).rejects.toThrow();
		});
	});
});

