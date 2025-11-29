/**
 * Test Setup Helpers
 *
 * These helpers create common test scenarios by setting up
 * the necessary database state. This reduces boilerplate
 * in individual test files.
 */

import type { Id } from "../_generated/dataModel";
import {
	TEST_SCHOOLS,
	TEST_USERS,
	createTestCourseData,
	createTestCourseUserData,
	createTestLessonData,
	createTestLessonEmbedData,
	createTestSiteConfigData,
	createTestSiteUserData,
	createTestUnitData,
} from "./testUtils";

// convex-test instance type - using ReturnType to infer from convexTest function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ConvexTestInstance = any;

/**
 * Sets up a site admin user for the given school
 */
export async function setupSiteAdmin(
	t: ConvexTestInstance,
	school: string = TEST_SCHOOLS.PRIMARY,
	userId: string = TEST_USERS.SITE_ADMIN.tokenIdentifier,
) {
	const siteUserId = await t.run(async (ctx: any) => {
		return await ctx.db.insert(
			"siteUser",
			createTestSiteUserData(userId, school),
		);
	});
	return { siteUserId, userId };
}

/**
 * Sets up a site configuration for testing
 */
export async function setupSiteConfig(
	t: ConvexTestInstance,
	school: string = TEST_SCHOOLS.PRIMARY,
) {
	const siteConfigId = await t.run(async (ctx: any) => {
		return await ctx.db.insert("siteConfig", createTestSiteConfigData(school));
	});
	return { siteConfigId };
}

/**
 * Creates a test course in the database
 */
export async function setupCourse(
	t: ConvexTestInstance,
	school: string = TEST_SCHOOLS.PRIMARY,
	overrides?: Parameters<typeof createTestCourseData>[1],
) {
	const courseId = await t.run(async (ctx: any) => {
		return await ctx.db.insert(
			"courses",
			createTestCourseData(school, overrides),
		);
	});
	return { courseId };
}

/**
 * Creates a test unit in the database
 */
export async function setupUnit(
	t: ConvexTestInstance,
	courseId: Id<"courses">,
	school: string = TEST_SCHOOLS.PRIMARY,
	overrides?: Parameters<typeof createTestUnitData>[2],
) {
	const unitId = await t.run(async (ctx: any) => {
		return await ctx.db.insert(
			"units",
			createTestUnitData(courseId, school, overrides),
		);
	});
	return { unitId };
}

/**
 * Creates a test lesson in the database
 */
export async function setupLesson(
	t: ConvexTestInstance,
	courseId: Id<"courses">,
	unitId: Id<"units">,
	school: string = TEST_SCHOOLS.PRIMARY,
	overrides?: Parameters<typeof createTestLessonData>[3],
) {
	const lessonId = await t.run(async (ctx: any) => {
		return await ctx.db.insert(
			"lessons",
			createTestLessonData(courseId, unitId, school, overrides),
		);
	});
	return { lessonId };
}

/**
 * Creates a test lesson embed in the database
 */
export async function setupLessonEmbed(
	t: ConvexTestInstance,
	lessonId: Id<"lessons">,
	school: string = TEST_SCHOOLS.PRIMARY,
	overrides?: Parameters<typeof createTestLessonEmbedData>[2],
) {
	const embedId = await t.run(async (ctx: any) => {
		return await ctx.db.insert(
			"lessonEmbeds",
			createTestLessonEmbedData(lessonId, school, overrides),
		);
	});
	return { embedId };
}

/**
 * Sets up a course user membership
 */
export async function setupCourseUser(
	t: ConvexTestInstance,
	courseId: Id<"courses">,
	userId: string,
	school: string,
	role: "admin" | "editor" | "user",
	permissions?: Parameters<typeof createTestCourseUserData>[4],
) {
	const courseUserId = await t.run(async (ctx: any) => {
		return await ctx.db.insert(
			"courseUsers",
			createTestCourseUserData(courseId, userId, school, role, permissions),
		);
	});
	return { courseUserId };
}

/**
 * Sets up a complete course with units and lessons for testing
 * Returns all the created IDs for use in tests
 */
export async function setupCompleteCourse(
	t: ConvexTestInstance,
	school: string = TEST_SCHOOLS.PRIMARY,
	options?: {
		isPublic?: boolean;
		unitCount?: number;
		lessonsPerUnit?: number;
		publishUnits?: boolean;
		publishLessons?: boolean;
	},
) {
	const isPublic = options?.isPublic ?? false;
	const unitCount = options?.unitCount ?? 2;
	const lessonsPerUnit = options?.lessonsPerUnit ?? 2;
	const publishUnits = options?.publishUnits ?? false;
	const publishLessons = options?.publishLessons ?? false;

	// Create the course
	const { courseId } = await setupCourse(t, school, {
		isPublic,
		name: "Complete Test Course",
	});

	const units: Array<{
		unitId: Id<"units">;
		lessons: Array<{ lessonId: Id<"lessons">; embedId: Id<"lessonEmbeds"> }>;
	}> = [];

	// Create units with lessons
	for (let u = 0; u < unitCount; u++) {
		const { unitId } = await setupUnit(t, courseId, school, {
			name: `Unit ${u + 1}`,
			order: u,
			isPublished: publishUnits,
		});

		const lessons: Array<{
			lessonId: Id<"lessons">;
			embedId: Id<"lessonEmbeds">;
		}> = [];

		for (let l = 0; l < lessonsPerUnit; l++) {
			const { lessonId } = await setupLesson(t, courseId, unitId, school, {
				name: `Lesson ${u + 1}.${l + 1}`,
				order: l,
				isPublished: publishLessons,
			});

			const { embedId } = await setupLessonEmbed(t, lessonId, school);

			lessons.push({ lessonId, embedId });
		}

		units.push({ unitId, lessons });
	}

	// Update course unit length
	await t.run(async (ctx: any) => {
		await ctx.db.patch(courseId, { unitLength: unitCount });
	});

	return { courseId, units };
}

/**
 * Sets up a complete testing environment with:
 * - Site configuration
 * - Site admin
 * - A course with units and lessons
 * - Course memberships
 */
export async function setupFullTestEnvironment(
	t: ConvexTestInstance,
	school: string = TEST_SCHOOLS.PRIMARY,
) {
	// Setup site config and admin
	const { siteConfigId } = await setupSiteConfig(t, school);
	const { siteUserId } = await setupSiteAdmin(t, school);

	// Setup a complete course
	const { courseId, units } = await setupCompleteCourse(t, school, {
		isPublic: true,
		publishUnits: true,
		publishLessons: true,
	});

	// Setup course users with different roles
	const { courseUserId: adminMembership } = await setupCourseUser(
		t,
		courseId,
		TEST_USERS.COURSE_ADMIN.tokenIdentifier,
		school,
		"admin",
	);

	const { courseUserId: editorMembership } = await setupCourseUser(
		t,
		courseId,
		TEST_USERS.COURSE_EDITOR.tokenIdentifier,
		school,
		"editor",
	);

	return {
		siteConfigId,
		siteUserId,
		courseId,
		units,
		adminMembership,
		editorMembership,
	};
}
