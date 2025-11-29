/**
 * Global Setup for E2E Tests
 *
 * This file runs before all tests and sets up:
 * - Clerk authentication testing environment
 * - Persistent auth state for multiple user types (USER, ADMIN, EDITOR)
 *
 * Auth states are saved to playwright/.clerk/ and reused by tests,
 * eliminating the need to sign in repeatedly (which can cause rate limiting).
 *
 * @see https://clerk.com/docs/guides/development/testing/playwright/overview
 * @see https://clerk.com/docs/guides/development/testing/playwright/test-authenticated-flows
 */

import path from "node:path";
import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";

// Setup must be run serially - required if Playwright is configured to run fully parallel
// @see https://playwright.dev/docs/test-parallel
setup.describe.configure({ mode: "serial" });

// Define paths to storage files for each user type
const AUTH_DIR = path.join(__dirname, "../playwright/.clerk");
export const USER_AUTH_FILE = path.join(AUTH_DIR, "user.json");
export const ADMIN_AUTH_FILE = path.join(AUTH_DIR, "admin.json");
export const EDITOR_AUTH_FILE = path.join(AUTH_DIR, "editor.json");

// Configure Playwright with Clerk (runs first)
setup("global setup", async () => {
	await clerkSetup();
});

/**
 * Authenticate as regular USER and save state to storage.
 * Tests using storageState: USER_AUTH_FILE will start authenticated as this user.
 */
setup("authenticate USER and save state", async ({ page }) => {
	if (!process.env.E2E_USER_EMAIL || !process.env.E2E_USER_PASSWORD) {
		console.log(
			"⚠️  Skipping USER auth state: E2E_USER_EMAIL or E2E_USER_PASSWORD not set",
		);
		return;
	}

	await page.goto("/");
	await clerk.signIn({
		page,
		signInParams: {
			strategy: "password",
			identifier: process.env.E2E_USER_EMAIL,
			password: process.env.E2E_USER_PASSWORD,
		},
	});

	await page.waitForSelector('[data-clerk-component="UserButton"]', {
		timeout: 10000,
	});

	await page.context().storageState({ path: USER_AUTH_FILE });
	console.log("✅ USER auth state saved to", USER_AUTH_FILE);
});

/**
 * Authenticate as ADMIN and save state to storage.
 * Tests using storageState: ADMIN_AUTH_FILE will start authenticated as admin.
 */
setup("authenticate ADMIN and save state", async ({ page }) => {
	if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
		console.log(
			"⚠️  Skipping ADMIN auth state: E2E_ADMIN_EMAIL or E2E_ADMIN_PASSWORD not set",
		);
		return;
	}

	await page.goto("/");
	await clerk.signIn({
		page,
		signInParams: {
			strategy: "password",
			identifier: process.env.E2E_ADMIN_EMAIL,
			password: process.env.E2E_ADMIN_PASSWORD,
		},
	});

	await page.waitForSelector('[data-clerk-component="UserButton"]', {
		timeout: 10000,
	});

	await page.context().storageState({ path: ADMIN_AUTH_FILE });
	console.log("✅ ADMIN auth state saved to", ADMIN_AUTH_FILE);
});

/**
 * Authenticate as EDITOR and save state to storage.
 * Tests using storageState: EDITOR_AUTH_FILE will start authenticated as editor.
 */
setup("authenticate EDITOR and save state", async ({ page }) => {
	if (!process.env.E2E_EDITOR_EMAIL || !process.env.E2E_EDITOR_PASSWORD) {
		console.log(
			"⚠️  Skipping EDITOR auth state: E2E_EDITOR_EMAIL or E2E_EDITOR_PASSWORD not set",
		);
		return;
	}

	await page.goto("/");
	await clerk.signIn({
		page,
		signInParams: {
			strategy: "password",
			identifier: process.env.E2E_EDITOR_EMAIL,
			password: process.env.E2E_EDITOR_PASSWORD,
		},
	});

	await page.waitForSelector('[data-clerk-component="UserButton"]', {
		timeout: 10000,
	});

	await page.context().storageState({ path: EDITOR_AUTH_FILE });
	console.log("✅ EDITOR auth state saved to", EDITOR_AUTH_FILE);
});
