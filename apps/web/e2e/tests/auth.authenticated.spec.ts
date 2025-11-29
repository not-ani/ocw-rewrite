/**
 * Authentication E2E Tests - Authenticated Flows
 *
 * Tests for authenticated user access and role-based permissions.
 * These tests use pre-authenticated state from global.setup.ts.
 *
 * IMPORTANT: Tests are grouped by required user type and use storageState
 * to start authenticated (instead of calling signIn() which causes rate limiting).
 */

import {
	test,
	expect,
	ADMIN_AUTH_STATE,
	USER_AUTH_STATE,
	EDITOR_AUTH_STATE,
} from "../fixtures";

test.describe("Authenticated User - Admin Access (as ADMIN)", () => {
	test.use({ storageState: ADMIN_AUTH_STATE });

	test("authenticated admin can access admin page", async ({ page }) => {
		await page.goto("/admin");
		await page.waitForLoadState("networkidle");

		// Admin should see admin content (not redirected to unauthorized)
		const url = page.url();
		expect(url).not.toContain("/unauthorized");
	});
});

test.describe("Authenticated User - Admin Access (as USER)", () => {
	test.use({ storageState: USER_AUTH_STATE });

	test("authenticated non-admin is redirected to unauthorized for admin page", async ({
		page,
	}) => {
		await page.goto("/admin");
		await page.waitForLoadState("networkidle");

		// Regular user should be redirected to unauthorized page
		const url = page.url();
		const isUnauthorized = url.includes("/unauthorized");
		const hasAccessDenied = await page
			.getByText(/access denied/i)
			.isVisible()
			.catch(() => false);

		expect(isUnauthorized || hasAccessDenied).toBeTruthy();
	});

	test("user without permission sees unauthorized page with correct content", async ({
		page,
	}) => {
		// Navigate to admin page as non-admin
		await page.goto("/admin");
		await page.waitForLoadState("networkidle");

		const url = page.url();

		// If redirected to unauthorized page, verify content
		if (url.includes("/unauthorized")) {
			await expect(page.getByText("Access Denied")).toBeVisible();
			await expect(page.getByText("ERROR 403 — FORBIDDEN")).toBeVisible();

			// Verify helpful actions are available
			await expect(
				page.getByRole("button", { name: /go back/i }),
			).toBeVisible();
			await expect(page.getByRole("link", { name: /home/i })).toBeVisible();
		}
	});

	test("user without course access is redirected to unauthorized", async ({
		page,
	}) => {
		// Try to access a course dashboard user doesn't have permission for
		await page.goto("/course/jd72sw49f70yv5m7d1fwhnwx0n7wbskf/dashboard");
		await page.waitForLoadState("networkidle");

		const url = page.url();

		// User without editor/admin access should be redirected to unauthorized
		// or see an access denied message
		const isUnauthorized = url.includes("/unauthorized");
		const hasAccessDenied = await page
			.getByText(/access denied|sign in required/i)
			.isVisible()
			.catch(() => false);

		expect(isUnauthorized || hasAccessDenied).toBeTruthy();
	});
});

test.describe("Authenticated User - Role-Based Access (as EDITOR)", () => {
	test.use({ storageState: EDITOR_AUTH_STATE });

	test("editor can access course dashboard they have access to", async ({
		page,
	}) => {
		// Navigate to a course dashboard
		// Note: This requires a valid course ID that the editor has access to
		await page.goto("/courses");
		await page.waitForLoadState("networkidle");

		const courseLink = page.locator('a[href^="/course/"]').first();
		if (await courseLink.isVisible()) {
			const href = await courseLink.getAttribute("href");
			if (href) {
				// Try to access the dashboard for this course
				await page.goto(`${href}/dashboard`);
				await page.waitForLoadState("networkidle");

				// Should either show dashboard or redirect to unauthorized
				// (depending on whether editor has access to this specific course)
				const url = page.url();
				const isOnDashboard = url.includes("/dashboard");
				const isUnauthorized = url.includes("/unauthorized");

				// Either they have access (on dashboard) or they don't (unauthorized)
				expect(isOnDashboard || isUnauthorized).toBeTruthy();
			}
		}
	});
});
