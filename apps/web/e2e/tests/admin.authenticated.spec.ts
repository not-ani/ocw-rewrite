/**
 * Admin Panel E2E Tests - Authenticated
 *
 * Tests for site administration functionality.
 * These tests use pre-authenticated state from global.setup.ts.
 *
 * IMPORTANT: Tests are grouped by required user type and use storageState
 * to start authenticated (instead of calling signIn() which causes rate limiting).
 */

import { test, expect, ADMIN_AUTH_STATE, USER_AUTH_STATE } from "../fixtures";

test.describe("Admin Panel - Access Control (as regular USER)", () => {
	// Use USER auth state - these tests verify non-admins are blocked
	test.use({ storageState: USER_AUTH_STATE });

	test("regular user cannot access admin panel", async ({ page }) => {
		await page.goto("/admin");
		await page.waitForLoadState("networkidle");

		// Should be redirected to unauthorized or show access denied
		const url = page.url();
		const isUnauthorized = url.includes("/unauthorized");
		const hasUnauthorizedMessage = await page
			.getByText(/unauthorized|access denied|permission/i)
			.isVisible()
			.catch(() => false);

		expect(isUnauthorized || hasUnauthorizedMessage).toBeTruthy();
	});
});

test.describe("Admin Panel - Access Control (as ADMIN)", () => {
	// Use ADMIN auth state - tests start already authenticated as admin
	test.use({ storageState: ADMIN_AUTH_STATE });

	test("site admin can access admin panel", async ({ page }) => {
		await page.goto("/admin");
		await page.waitForLoadState("networkidle");

		// Admin should see admin content (not redirected to unauthorized)
		const url = page.url();
		expect(url).not.toContain("/unauthorized");


		// Should see admin page content "Site Administration" 
		await expect(page.getByText(/Site Administration/i)).toBeVisible();
	});
});

test.describe("Admin Panel - Site Content Management", () => {
	test.use({ storageState: ADMIN_AUTH_STATE });

	test("should navigate to site content page", async ({ page }) => {
		await page.goto("/admin/site-content");
		await page.waitForLoadState("networkidle");

		// Should be on site content page
		const url = page.url();
		expect(url).toContain("/admin/site-content");
	});
});

test.describe("Admin Panel - Courses Management", () => {
	test.use({ storageState: ADMIN_AUTH_STATE });

	test("should display courses section in admin", async ({ page }) => {
		await page.goto("/admin");
		await page.waitForLoadState("networkidle");

		// Look for courses section heading or table
		const coursesSection = page.getByText(/courses/i);
		await expect(coursesSection.first()).toBeVisible();
	});

	test("should have add course button", async ({ page }) => {
		await page.goto("/admin");
		await page.waitForLoadState("networkidle");

		// Look for add course button
		const addButton = page.getByRole("button", {
			name: /add.*course|create.*course|new.*course/i,
		});
		// Verify button exists (may need to scroll or expand section)
		const isVisible = await addButton.isVisible().catch(() => false);
		// Admin should have access to this functionality
		expect(isVisible).toBeTruthy();
	});
});

test.describe("Admin Panel - Admins Management", () => {
	test.use({ storageState: ADMIN_AUTH_STATE });

	test("should display admins section", async ({ page }) => {
		await page.goto("/admin");
		await page.waitForLoadState("networkidle");

		// Look for admins section
		const adminsSection = page.getByText(/admin/i);
		await expect(adminsSection.first()).toBeVisible();
	});

	test("should have add admin button", async ({ page }) => {
		await page.goto("/admin");
		await page.waitForLoadState("networkidle");

		// Look for add admin button
		const addButton = page.getByRole("button", {
			name: /add.*admin|invite.*admin/i,
		});
		const isVisible = await addButton.isVisible().catch(() => false);
		expect(isVisible).toBeTruthy();
	});
});

test.describe("Admin Panel - Fork Course", () => {
	test.use({ storageState: ADMIN_AUTH_STATE });

	test("should have fork course functionality", async ({ page }) => {
		await page.goto("/admin");
		await page.waitForLoadState("networkidle");

		// Look for fork course button (may be in a dropdown or action menu)
		const forkButton = page.getByRole("button", { name: /fork/i });
		const isVisible = await forkButton.isVisible().catch(() => false);
		// Fork functionality should be available to admins
		expect(isVisible).toBeTruthy();
	});
});
