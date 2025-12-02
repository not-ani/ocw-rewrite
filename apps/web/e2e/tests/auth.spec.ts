/**
 * Authentication E2E Tests - Unauthenticated Flows
 *
 * Tests for public access and authentication redirects.
 * These tests verify behavior for unauthenticated users.
 *
 * For tests requiring authenticated state, see auth.authenticated.spec.ts
 */

import { expect, test } from "../fixtures";

test.describe("Authentication - Public Access", () => {
	test("unauthenticated user can view homepage", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");

		await expect(page).toHaveTitle(/OpenCourseWare/i);
	});

	test("unauthenticated user can view courses page", async ({ page }) => {
		await page.goto("/courses");
		await page.waitForLoadState("networkidle");

		// Should be able to view courses without signing in
		const content = page.locator("body");
		await expect(content).toBeVisible();
	});

	test("unauthenticated user can view public course detail", async ({
		page,
	}) => {
		await page.goto("/courses");
		await page.waitForLoadState("networkidle");

		// Try to click on a course if available
		const courseLink = page.locator('a[href^="/course/"]').first();
		if (await courseLink.isVisible()) {
			await courseLink.click();
			await page.waitForLoadState("networkidle");

			// Should be able to view without auth
			const content = page.locator("body");
			await expect(content).toBeVisible();
		}
	});
});

test.describe("Authentication - Protected Routes", () => {
	test("admin page redirects unauthenticated users", async ({ page }) => {
		await page.goto("/admin");
		await page.waitForLoadState("networkidle");

		const url = page.url();

		const isRedirectedToUnauthorized = url.includes("/unauthorized");

		expect(isRedirectedToUnauthorized).toBeTruthy();
	});

	test("course dashboard redirects unauthenticated users", async ({ page }) => {
		await page.goto("/course/jd72sw49f70yv5m7d1fwhnwx0n7wbskf/dashboard");
		await page.waitForLoadState("networkidle");

		const url = page.url();
		const isRedirectedToUnauthorized = url.includes("/unauthorized");
		expect(isRedirectedToUnauthorized).toBeTruthy();
	});
});

test.describe("Authentication - Unauthorized Page", () => {
	test("unauthorized page displays correctly", async ({ page }) => {
		await page.goto("/unauthorized");
		await page.waitForLoadState("networkidle");

		// Check for the main elements of the unauthorized page
		await expect(page.getByText("Access Denied")).toBeVisible();
		await expect(
			page.getByText(/don't have permission to view this page/i),
		).toBeVisible();

		// Check for the error badge
		await expect(page.getByText("ERROR 403 — FORBIDDEN")).toBeVisible();

		// Check for navigation buttons
		await expect(page.getByRole("button", { name: /go back/i })).toBeVisible();
		await expect(page.getByRole("link", { name: /home/i })).toBeVisible();
	});
});

test.describe("Authentication - Sign In Flow", () => {
	test("should show sign in button", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");

		const hasSignIn = await page.getByText(/sign in/i).isVisible();
		expect(hasSignIn).toBeTruthy();
	});
});
