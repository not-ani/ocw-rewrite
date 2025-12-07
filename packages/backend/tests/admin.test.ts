/**
 * Admin and Site Configuration Integration Tests
 *
 * Tests for admin functionality and site configuration:
 * - Site admin management
 * - Course management (admin level)
 * - Site configuration CRUD
 */

import { describe, expect, it } from "vitest";
import { api } from "../convex/_generated/api";
import { createConvexTest } from "./convexTestHelper";
import { setupCourse, setupSiteAdmin, setupSiteConfig } from "./setup";
import { createMockClerkIdentity, TEST_SCHOOLS, TEST_USERS } from "./testUtils";

describe("Admin", () => {
	describe("getAllCourses", () => {
		it("returns all courses for site admin", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);

			await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
				name: "Public Course",
				isPublic: true,
			});
			await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
				name: "Private Course",
				isPublic: false,
			});

			const result = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.query(api.admin.getAllCourses, {
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result).toHaveLength(2);
		});

		it("only returns courses from the specified school", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);

			await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
				name: "Primary School Course",
			});
			await setupCourse(t, TEST_SCHOOLS.SECONDARY, {
				name: "Secondary School Course",
			});

			const result = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.query(api.admin.getAllCourses, {
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result).toHaveLength(1);
			expect(result[0]?.school).toBe(TEST_SCHOOLS.PRIMARY);
		});

		it("rejects non-admin users", async () => {
			const t = createConvexTest();

			await expect(
				t.withIdentity(TEST_USERS.REGULAR_USER).query(api.admin.getAllCourses, {
					school: TEST_SCHOOLS.PRIMARY,
				}),
			).rejects.toThrow();
		});

		it("rejects unauthenticated users", async () => {
			const t = createConvexTest();

			await expect(
				t.query(api.admin.getAllCourses, {
					school: TEST_SCHOOLS.PRIMARY,
				}),
			).rejects.toThrow("Not authenticated");
		});
	});

	describe("updateCourseStatus", () => {
		it("updates course public status", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY, {
				isPublic: false,
			});

			await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.admin.updateCourseStatus, {
					courseId,
					isPublic: true,
					school: TEST_SCHOOLS.PRIMARY,
				});

			const course = await t.query(api.courses.getCourseById, {
				courseId,
				school: TEST_SCHOOLS.PRIMARY,
			});
			expect(course?.isPublic).toBe(true);
		});

		it("rejects non-admin users", async () => {
			const t = createConvexTest();

			const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

			await expect(
				t
					.withIdentity(TEST_USERS.REGULAR_USER)
					.mutation(api.admin.updateCourseStatus, {
						courseId,
						isPublic: true,
						school: TEST_SCHOOLS.PRIMARY,
					}),
			).rejects.toThrow();
		});
	});

	describe("getAllSiteAdmins", () => {
		it("returns all site admins", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);

			// Add another admin
			await t.run(async (ctx) => {
				await ctx.db.insert("siteUser", {
					userId: createMockClerkIdentity("admin2").tokenIdentifier,
					role: "admin",
					school: TEST_SCHOOLS.PRIMARY,
				});
			});

			const result = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.query(api.admin.getAllSiteAdmins, {
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result).toHaveLength(2);
		});

		it("only returns admins from the specified school", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			await setupSiteAdmin(
				t,
				TEST_SCHOOLS.SECONDARY,
				createMockClerkIdentity("secondary-admin").tokenIdentifier,
			);

			const result = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.query(api.admin.getAllSiteAdmins, {
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result).toHaveLength(1);
			expect(result[0]?.school).toBe(TEST_SCHOOLS.PRIMARY);
		});
	});

	describe("addSiteAdmin", () => {
		it("adds a new site admin", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const newAdminId = createMockClerkIdentity("new-admin").tokenIdentifier;

			const result = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.admin.addSiteAdmin, {
					userId: newAdminId,
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result).toBeDefined();

			// Verify the new admin was added
			const admins = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.query(api.admin.getAllSiteAdmins, {
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(admins.some((a) => a.userId === newAdminId)).toBe(true);
		});

		it("throws error if user is already admin", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);

			await expect(
				t.withIdentity(TEST_USERS.SITE_ADMIN).mutation(api.admin.addSiteAdmin, {
					userId: TEST_USERS.SITE_ADMIN.tokenIdentifier,
					school: TEST_SCHOOLS.PRIMARY,
				}),
			).rejects.toThrow("User is already a site admin");
		});
	});

	describe("removeSiteAdmin", () => {
		it("removes a site admin", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
			const adminToRemove =
				createMockClerkIdentity("to-remove").tokenIdentifier;

			await t.run(async (ctx) => {
				await ctx.db.insert("siteUser", {
					userId: adminToRemove,
					role: "admin",
					school: TEST_SCHOOLS.PRIMARY,
				});
			});

			await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.admin.removeSiteAdmin, {
					userId: adminToRemove,
					school: TEST_SCHOOLS.PRIMARY,
				});

			// Verify removal
			const admins = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.query(api.admin.getAllSiteAdmins, {
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(admins.some((a) => a.userId === adminToRemove)).toBe(false);
		});

		it("prevents removing yourself", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);

			await expect(
				t
					.withIdentity(TEST_USERS.SITE_ADMIN)
					.mutation(api.admin.removeSiteAdmin, {
						userId: TEST_USERS.SITE_ADMIN.tokenIdentifier,
						school: TEST_SCHOOLS.PRIMARY,
					}),
			).rejects.toThrow("Cannot remove yourself as an admin");
		});

		it("throws error for non-existent admin", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);

			await expect(
				t
					.withIdentity(TEST_USERS.SITE_ADMIN)
					.mutation(api.admin.removeSiteAdmin, {
						userId: "non-existent-user",
						school: TEST_SCHOOLS.PRIMARY,
					}),
			).rejects.toThrow("User is not a site admin");
		});
	});

	describe("isSiteAdmin", () => {
		it("returns true for site admin", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);

			const result = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.query(api.admin.isSiteAdmin, {
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result).toBe(true);
		});

		it("returns false for non-admin", async () => {
			const t = createConvexTest();

			const result = await t
				.withIdentity(TEST_USERS.REGULAR_USER)
				.query(api.admin.isSiteAdmin, {
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(result).toBe(false);
		});

		it("returns false for unauthenticated user", async () => {
			const t = createConvexTest();

			const result = await t.query(api.admin.isSiteAdmin, {
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result).toBe(false);
		});

		it("returns false for admin in different school", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);

			const result = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.query(api.admin.isSiteAdmin, {
					school: TEST_SCHOOLS.SECONDARY,
				});

			expect(result).toBe(false);
		});
	});

	describe("createCourse", () => {
		it("creates a new course", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);

			const courseId = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.admin.createCourse, {
					name: "New Course",
					description: "A brand new course",
					subjectId: "MATH",
					isPublic: false,
					school: TEST_SCHOOLS.PRIMARY,
				});

			expect(courseId).toBeDefined();

			const course = await t.run(async (ctx) => ctx.db.get(courseId));

			expect(course?.name).toBe("New Course");
			expect(course?.description).toBe("A brand new course");
			expect(course?.subjectId).toBe("MATH");
			expect(course?.isPublic).toBe(false);
			expect(course?.unitLength).toBe(0);
		});

		it("allows creating public courses", async () => {
			const t = createConvexTest();

			await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);

			const courseId = await t
				.withIdentity(TEST_USERS.SITE_ADMIN)
				.mutation(api.admin.createCourse, {
					name: "Public Course",
					description: "A public course",
					subjectId: "SCI",
					isPublic: true,
					school: TEST_SCHOOLS.PRIMARY,
				});

			const course = await t.run(async (ctx) => ctx.db.get(courseId));
			expect(course?.isPublic).toBe(true);
		});

		it("rejects non-admin users", async () => {
			const t = createConvexTest();

			await expect(
				t
					.withIdentity(TEST_USERS.REGULAR_USER)
					.mutation(api.admin.createCourse, {
						name: "Should Fail",
						description: "Description",
						subjectId: "TEST",
						isPublic: false,
						school: TEST_SCHOOLS.PRIMARY,
					}),
			).rejects.toThrow();
		});
	});
});

describe("Site Configuration", () => {
	describe("getSiteConfig", () => {
		it("returns site config for a school", async () => {
			const t = createConvexTest();

			await setupSiteConfig(t, TEST_SCHOOLS.PRIMARY);

			const result = await t.query(api.site.getSiteConfig, {
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(result).not.toBeNull();
			expect(result?.school).toBe(TEST_SCHOOLS.PRIMARY);
		});

		it("returns special config for www school", async () => {
			const t = createConvexTest();

			const result = await t.query(api.site.getSiteConfig, {
				school: "www",
			});

			expect(result).not.toBeNull();
			expect(result?.school).toBe("www");
			expect(result?.schoolName).toBe("The OpenCourseWare Project");
		});

		it("returns null for non-existent school", async () => {
			const t = createConvexTest();

			const result = await t.query(api.site.getSiteConfig, {
				school: "non-existent-school",
			});

			expect(result).toBeNull();
		});
	});

	describe("getSites", () => {
		it("returns all site configurations", async () => {
			const t = createConvexTest();

			await setupSiteConfig(t, TEST_SCHOOLS.PRIMARY);
			await setupSiteConfig(t, TEST_SCHOOLS.SECONDARY);

			const result = await t.query(api.site.getSites, {});

			expect(result).toHaveLength(2);
		});
	});

	describe("updateSiteConfigBasicFields", () => {
		it("updates basic site fields", async () => {
			const t = createConvexTest();

			await setupSiteConfig(t, TEST_SCHOOLS.PRIMARY);

			await t.mutation(api.site.updateSiteConfigBasicFields, {
				school: TEST_SCHOOLS.PRIMARY,
				schoolName: "Updated School Name",
				siteHero: "New hero text",
				siteLogo: "https://example.com/logo.png",
				instagramUrl: "https://instagram.com/school",
				siteContributeLink: "https://contribute.example.com",
			});

			const config = await t.query(api.site.getSiteConfig, {
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(config?.schoolName).toBe("Updated School Name");
			expect(config?.siteHero).toBe("New hero text");
			expect(config?.siteLogo).toBe("https://example.com/logo.png");
		});

		it("throws error for non-existent site", async () => {
			const t = createConvexTest();

			await expect(
				t.mutation(api.site.updateSiteConfigBasicFields, {
					school: "non-existent",
					schoolName: "Test",
				}),
			).rejects.toThrow("Site configuration not found");
		});
	});

	describe("updateClubInfo", () => {
		it("updates club information", async () => {
			const t = createConvexTest();

			await setupSiteConfig(t, TEST_SCHOOLS.PRIMARY);

			await t.mutation(api.site.updateClubInfo, {
				school: TEST_SCHOOLS.PRIMARY,
				clubName: "Computer Science Club",
				clubEmail: "cs-club@school.edu",
			});

			const config = await t.query(api.site.getSiteConfig, {
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(config?.club?.name).toBe("Computer Science Club");
			expect(config?.club?.email).toBe("cs-club@school.edu");
		});
	});

	describe("contributors", () => {
		it("creates and retrieves contributors", async () => {
			const t = createConvexTest();

			await setupSiteConfig(t, TEST_SCHOOLS.PRIMARY);

			const contributorId1 = await t.mutation(api.site.createContributor, {
				school: TEST_SCHOOLS.PRIMARY,
				name: "John Doe",
				role: "Developer",
				avatar: "https://example.com/avatar.png",
				description: "Backend developer",
			});

			const contributorId2 = await t.mutation(api.site.createContributor, {
				school: TEST_SCHOOLS.PRIMARY,
				name: "Jane Smith",
				role: "Designer",
				avatar: "https://example.com/avatar2.png",
				description: "UI/UX designer",
			});

			const contributors = await t.query(api.site.getContributors, {
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(contributors).toHaveLength(2);
			expect(contributors?.[0]?.name).toBe("John Doe");
			expect(contributors?.[1]?.name).toBe("Jane Smith");
		});

		it("updates a contributor", async () => {
			const t = createConvexTest();

			await setupSiteConfig(t, TEST_SCHOOLS.PRIMARY);

			const contributorId = await t.mutation(api.site.createContributor, {
				school: TEST_SCHOOLS.PRIMARY,
				name: "John Doe",
				role: "Developer",
				avatar: "https://example.com/avatar.png",
				description: "Backend developer",
			});

			await t.mutation(api.site.updateContributor, {
				contributorId,
				name: "John Updated",
				role: "Senior Developer",
			});

			const contributors = await t.query(api.site.getContributors, {
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(contributors).toHaveLength(1);
			expect(contributors?.[0]?.name).toBe("John Updated");
			expect(contributors?.[0]?.role).toBe("Senior Developer");
		});

		it("deletes a contributor", async () => {
			const t = createConvexTest();

			await setupSiteConfig(t, TEST_SCHOOLS.PRIMARY);

			const contributorId = await t.mutation(api.site.createContributor, {
				school: TEST_SCHOOLS.PRIMARY,
				name: "John Doe",
				role: "Developer",
				avatar: "https://example.com/avatar.png",
				description: "Backend developer",
			});

			await t.mutation(api.site.deleteContributor, {
				contributorId,
			});

			const contributors = await t.query(api.site.getContributors, {
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(contributors).toHaveLength(0);
		});
	});

	describe("updatePersonsContact", () => {
		it("updates contact persons list", async () => {
			const t = createConvexTest();

			await setupSiteConfig(t, TEST_SCHOOLS.PRIMARY);

			await t.mutation(api.site.updatePersonsContact, {
				school: TEST_SCHOOLS.PRIMARY,
				personsContact: [
					{
						name: "Support Team",
						email: "support@school.edu",
						description: "General support",
					},
				],
			});

			const config = await t.query(api.site.getSiteConfig, {
				school: TEST_SCHOOLS.PRIMARY,
			});

			expect(config?.personsContact).toHaveLength(1);
			expect(config?.personsContact?.[0]?.name).toBe("Support Team");
		});
	});
});
