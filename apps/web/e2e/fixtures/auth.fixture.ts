/**
 * Authentication Fixtures for E2E Tests
 *
 * Provides auth state paths and helper functions for testing with different
 * authentication states using Clerk's testing utilities.
 *
 * BEST PRACTICE: Use storageState instead of calling signIn() in tests.
 * - Tests should use `test.use({ storageState: USER_AUTH_STATE })` to start authenticated
 * - This avoids rate limiting and speeds up test execution
 * - Auth states are created in global.setup.ts
 *
 * @see https://clerk.com/docs/guides/development/testing/playwright/overview
 * @see https://clerk.com/docs/guides/development/testing/playwright/test-authenticated-flows
 */

import { clerk } from "@clerk/testing/playwright";
import { test as base, expect, type Page } from "@playwright/test";
import path from "node:path";

/**
 * Auth state paths for different user types.
 * Use these with `test.use({ storageState: ... })` to start tests already authenticated.
 *
 * @example
 * ```ts
 * import { test, USER_AUTH_STATE } from "../fixtures";
 * test.use({ storageState: USER_AUTH_STATE });
 *
 * test("my test", async ({ page }) => {
 *   // Already authenticated as USER - no need to call signIn()
 *   await page.goto("/dashboard");
 * });
 * ```
 */
export const USER_AUTH_STATE = path.join(
	__dirname,
	"../../playwright/.clerk/user.json",
);
export const ADMIN_AUTH_STATE = path.join(
	__dirname,
	"../../playwright/.clerk/admin.json",
);
export const EDITOR_AUTH_STATE = path.join(
	__dirname,
	"../../playwright/.clerk/editor.json",
);

/**
 * @deprecated Use USER_AUTH_STATE, ADMIN_AUTH_STATE, or EDITOR_AUTH_STATE instead.
 */
export const AUTH_STATE_PATH = USER_AUTH_STATE;

/**
 * Test user credentials for E2E testing.
 *
 * IMPORTANT: Create these test users in your Clerk dashboard
 * for your development instance. Never use real user credentials.
 *
 * NOTE: Prefer using storageState over signIn() to avoid rate limiting.
 * These credentials are primarily used in global.setup.ts to create auth states.
 */
export const TEST_USERS = {
	ADMIN: {
		email: process.env.E2E_ADMIN_EMAIL || "e2e-admin@test.com",
		password: process.env.E2E_ADMIN_PASSWORD || "TestPassword123!",
	},
	EDITOR: {
		email: process.env.E2E_EDITOR_EMAIL || "e2e-editor@test.com",
		password: process.env.E2E_EDITOR_PASSWORD || "TestPassword123!",
	},
	USER: {
		email: process.env.E2E_USER_EMAIL || "e2e-user@test.com",
		password: process.env.E2E_USER_PASSWORD || "TestPassword123!",
	},
} as const;

export type TestUser = (typeof TEST_USERS)[keyof typeof TEST_USERS];

/**
 * Extended test fixture that provides Clerk authentication utilities.
 *
 * IMPORTANT: Prefer using storageState over signIn() to avoid rate limiting.
 *
 * @example Using storageState (preferred):
 * ```ts
 * import { test, ADMIN_AUTH_STATE } from "../fixtures";
 * test.use({ storageState: ADMIN_AUTH_STATE });
 *
 * test("admin test", async ({ page }) => {
 *   await page.goto("/admin");
 *   // Already authenticated as admin
 * });
 * ```
 *
 * @example Using signIn (only for edge cases):
 * ```ts
 * import { test, TEST_USERS } from "../fixtures";
 *
 * test("multi-user test", async ({ page, signIn }) => {
 *   // Only use signIn when you need to switch users mid-test
 *   await signIn(TEST_USERS.ADMIN);
 * });
 * ```
 */
export const test = base.extend<{
	/**
	 * Sign in as a test user using Clerk's testing helper.
	 *
	 * ⚠️ PREFER using storageState instead to avoid rate limiting.
	 * Only use this for edge cases like switching users mid-test.
	 */
	signIn: (user?: TestUser) => Promise<void>;
	/**
	 * Sign out the current user.
	 */
	signOut: () => Promise<void>;
	/**
	 * Assert that Clerk has loaded on the current page.
	 */
	clerkLoaded: () => Promise<void>;
	/**
	 * Check if the user is currently authenticated.
	 */
	isAuthenticated: () => Promise<boolean>;
}>({
	signIn: async ({ page }, use) => {
		const signIn = async (user: TestUser = TEST_USERS.USER) => {
			// Navigate to an unprotected page that loads Clerk (required before clerk.signIn)
			await page.goto("/");

			// Check if already signed in (from storageState) and sign out first
			const isAlreadySignedIn = await page
				.locator('[data-clerk-component="UserButton"]')
				.isVisible({ timeout: 3000 })
				.catch(() => false);

			if (isAlreadySignedIn) {
				await clerk.signOut({ page });
				await page.waitForSelector('[data-clerk-component="UserButton"]', {
					state: "detached",
					timeout: 10000,
				});
			}

			await clerk.signIn({
				page,
				signInParams: {
					strategy: "password",
					identifier: user.email,
					password: user.password,
				},
			});

			await page.waitForSelector('[data-clerk-component="UserButton"]', {
				timeout: 10000,
			});
		};
		await use(signIn);
	},

	signOut: async ({ page }, use) => {
		const signOut = async () => {
			await clerk.signOut({ page });
		};
		await use(signOut);
	},

	clerkLoaded: async ({ page }, use) => {
		const clerkLoaded = async () => {
			await clerk.loaded({ page });
		};
		await use(clerkLoaded);
	},

	isAuthenticated: async ({ page }, use) => {
		const isAuthenticated = async () => {
			const userButton = page.locator("[data-clerk-user-button]");
			return userButton.isVisible({ timeout: 5000 }).catch(() => false);
		};
		await use(isAuthenticated);
	},
});

export { expect };

/**
 * Helper to sign in a user on a given page.
 *
 * ⚠️ PREFER using storageState instead to avoid rate limiting.
 * Only use this for edge cases like multi-browser tests.
 */
export async function signInUser(
	page: Page,
	user: TestUser = TEST_USERS.USER,
): Promise<void> {
	await page.goto("/");

	const isAlreadySignedIn = await page
		.locator('[data-clerk-component="UserButton"]')
		.isVisible({ timeout: 3000 })
		.catch(() => false);

	if (isAlreadySignedIn) {
		await clerk.signOut({ page });
		await page.waitForSelector('[data-clerk-component="UserButton"]', {
			state: "detached",
			timeout: 10000,
		});
	}

	await clerk.signIn({
		page,
		signInParams: {
			strategy: "password",
			identifier: user.email,
			password: user.password,
		},
	});

	await page.waitForSelector('[data-clerk-component="UserButton"]', {
		timeout: 10000,
	});
}
