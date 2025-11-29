/**
 * Combined E2E Test Fixtures
 *
 * This module merges all fixtures together to provide a unified
 * test context with authentication, Convex, and page utilities.
 */

import { mergeTests, type Page } from "@playwright/test";
import {
	test as authTest,
	expect,
	TEST_USERS,
	AUTH_STATE_PATH,
	USER_AUTH_STATE,
	ADMIN_AUTH_STATE,
	EDITOR_AUTH_STATE,
	signInUser,
	type TestUser,
} from "./auth.fixture";
import {
	test as convexTest,
	E2E_TEST_SCHOOLS,
	createTestDataTracker,
} from "./convex.fixture";

// Merge all fixtures into a single test export
export const test = mergeTests(authTest, convexTest);

// Re-export commonly used items
export {
	expect,
	TEST_USERS,
	// Auth state paths for different user types (preferred over signIn)
	USER_AUTH_STATE,
	ADMIN_AUTH_STATE,
	EDITOR_AUTH_STATE,
	AUTH_STATE_PATH, // @deprecated - use USER_AUTH_STATE instead
	signInUser,
	E2E_TEST_SCHOOLS,
	createTestDataTracker,
	type TestUser,
};

/**
 * Page object model base for creating page objects.
 * Extend this for specific pages in your app.
 */
export class BasePage {
	constructor(protected page: Page) {}

	async goto(path: string) {
		await this.page.goto(path);
	}

	async waitForPageLoad() {
		await this.page.waitForLoadState("networkidle");
	}

	async getTitle() {
		return this.page.title();
	}
}

