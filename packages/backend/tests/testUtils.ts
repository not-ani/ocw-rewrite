/**
 * Test utilities and helpers for Convex backend tests
 *
 * This module provides:
 * - Authentication identity mocking for Clerk integration
 * - Common test fixtures (schools, courses, units, lessons)
 * - Helper functions for setting up test data
 */

import type { Id } from "../convex/_generated/dataModel";

// ==========================================
// Authentication Identity Mocking for Clerk
// ==========================================

/**
 * Creates a mock Clerk user identity for testing.
 * The tokenIdentifier format matches Clerk's format: "issuer|subject"
 */
export function createMockClerkIdentity(
	userId: string,
	options?: {
		email?: string;
		name?: string;
	},
) {
	return {
		// Clerk uses tokenIdentifier in format: "issuer|subject"
		tokenIdentifier: `https://clerk.test|${userId}`,
		subject: userId,
		email: options?.email ?? `${userId}@test.com`,
		name: options?.name ?? `Test User ${userId}`,
		issuer: "https://clerk.test",
	};
}

/**
 * Pre-defined test users with different roles
 */
export const TEST_USERS = {
	SITE_ADMIN: createMockClerkIdentity("site-admin-001", {
		email: "admin@testschool.edu",
		name: "Site Admin",
	}),
	COURSE_ADMIN: createMockClerkIdentity("course-admin-001", {
		email: "courseadmin@testschool.edu",
		name: "Course Admin",
	}),
	COURSE_EDITOR: createMockClerkIdentity("course-editor-001", {
		email: "editor@testschool.edu",
		name: "Course Editor",
	}),
	REGULAR_USER: createMockClerkIdentity("regular-user-001", {
		email: "user@testschool.edu",
		name: "Regular User",
	}),
	UNAUTHENTICATED: null,
} as const;

// ==========================================
// Test Fixtures - Schools
// ==========================================

export const TEST_SCHOOLS = {
	PRIMARY: "test-school",
	SECONDARY: "other-school",
} as const;

// ==========================================
// Test Fixtures - Course Data
// ==========================================

export function createTestCourseData(
	school: string,
	overrides?: Partial<{
		name: string;
		description: string;
		subjectId: string;
		isPublic: boolean;
		aliases: string[];
		imageUrl: string;
	}>,
) {
	return {
		name: overrides?.name ?? "Test Course",
		description: overrides?.description ?? "A test course description",
		subjectId: overrides?.subjectId ?? "MATH",
		isPublic: overrides?.isPublic ?? false,
		aliases: overrides?.aliases ?? [],
		imageUrl: overrides?.imageUrl,
		unitLength: 0,
		school,
	};
}

// ==========================================
// Test Fixtures - Unit Data
// ==========================================

export function createTestUnitData(
	courseId: Id<"courses">,
	school: string,
	overrides?: Partial<{
		name: string;
		description: string;
		isPublished: boolean;
		order: number;
	}>,
) {
	return {
		courseId,
		name: overrides?.name ?? "Test Unit",
		description: overrides?.description,
		isPublished: overrides?.isPublished ?? false,
		order: overrides?.order ?? 0,
		school,
	};
}

// ==========================================
// Test Fixtures - Lesson Data
// ==========================================

export function createTestLessonData(
	courseId: Id<"courses">,
	unitId: Id<"units">,
	school: string,
	overrides?: Partial<{
		name: string;
		contentType:
			| "google_docs"
			| "google_drive"
			| "other"
			| "notion"
			| "quizlet"
			| "youtube";
		isPublished: boolean;
		pureLink: boolean;
		order: number;
	}>,
) {
	return {
		courseId,
		unitId,
		name: overrides?.name ?? "Test Lesson",
		contentType: overrides?.contentType ?? "google_docs",
		isPublished: overrides?.isPublished ?? false,
		pureLink: overrides?.pureLink ?? true,
		order: overrides?.order ?? 0,
		school,
	};
}

// ==========================================
// Test Fixtures - Lesson Embed Data
// ==========================================

export function createTestLessonEmbedData(
	lessonId: Id<"lessons">,
	school: string,
	overrides?: Partial<{
		embedUrl: string;
		password: string;
	}>,
) {
	return {
		lessonId,
		embedUrl:
			overrides?.embedUrl ??
			"https://docs.google.com/document/d/test-doc-id/preview",
		password: overrides?.password,
		school,
	};
}

// ==========================================
// Test Fixtures - Site Config Data
// ==========================================

export function createTestSiteConfigData(
	school: string,
	overrides?: Partial<{
		schoolName: string;
		siteHero: string;
		siteLogo: string;
		instagramUrl: string;
		siteContributeLink: string;
	}>,
) {
	return {
		school,
		schoolName: overrides?.schoolName ?? "Test School",
		siteHero: overrides?.siteHero ?? "Welcome to our test school",
		siteLogo: overrides?.siteLogo,
		instagramUrl: overrides?.instagramUrl,
		siteContributeLink: overrides?.siteContributeLink,
		contributors: [],
		personsContact: [],
	};
}

// ==========================================
// Test Fixtures - Course User Data
// ==========================================

export function createTestCourseUserData(
	courseId: Id<"courses">,
	userId: string,
	school: string,
	role: "admin" | "editor" | "user",
	permissions?: Array<
		| "create_unit"
		| "edit_unit"
		| "delete_unit"
		| "create_lesson"
		| "edit_lesson"
		| "delete_lesson"
		| "reorder_lesson"
		| "manage_users"
		| "manage_course"
	>,
) {
	return {
		courseId,
		userId,
		role,
		permissions,
		school,
	};
}

// ==========================================
// Test Fixtures - Site User (Admin) Data
// ==========================================

export function createTestSiteUserData(userId: string, school: string) {
	return {
		userId,
		role: "admin" as const,
		school,
	};
}

// ==========================================
// Test Data Embed URLs
// ==========================================

export const TEST_EMBED_URLS = {
	GOOGLE_DOCS: "https://docs.google.com/document/d/abc123/edit",
	GOOGLE_DRIVE: "https://drive.google.com/file/d/xyz789/view",
	YOUTUBE: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
	YOUTUBE_EMBED: "https://www.youtube.com/embed/dQw4w9WgXcQ",
	QUIZLET: "https://quizlet.com/123456789/test-set",
	NOTION: "https://notion.so/test-page-123",
	OTHER: "https://example.com/some-resource",
} as const;

