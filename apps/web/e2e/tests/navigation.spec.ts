/**
 * Navigation E2E Tests
 *
 * Tests for basic navigation flows and page accessibility.
 * These tests run without authentication.
 */

import { test, expect } from "../fixtures";

test.describe("Homepage Navigation", () => {
	test("should load the homepage", async ({ page }) => {
		await page.goto("/");
		await expect(page).toHaveTitle(/OpenCourseWare/i);
	});

	test("should display the hero section", async ({ page }) => {
		await page.goto("/");

		// Wait for the page to load
		await page.waitForLoadState("networkidle");

		// Check that main content is visible
		const main = page.locator("main");
		await expect(main).toBeVisible();
	});

});

test.describe("Marketing Pages Navigation", () => {
	test("should navigate to about page", async ({ page }) => {
		await page.goto("/about");
		await page.waitForLoadState("networkidle");

		await expect(page).toHaveURL(/\/about/);
	});

	test("should navigate to contact page", async ({ page }) => {
		await page.goto("/contact");
		await page.waitForLoadState("networkidle");

		await expect(page).toHaveURL(/\/contact/);
	});

	test("should navigate to contribute page", async ({ page }) => {
		await page.goto("/contribute");
		await page.waitForLoadState("networkidle");

		await expect(page).toHaveURL(/\/contribute/);
	});

	test("should navigate to contributors page", async ({ page }) => {
		await page.goto("/contributors");
		await page.waitForLoadState("networkidle");

		await expect(page).toHaveURL(/\/contributors/);
	});
});

test.describe("404 Page", () => {
	test("should show 404 page for non-existent routes", async ({ page }) => {
		await page.goto("/this-page-does-not-exist");
		await page.waitForLoadState("networkidle");

		// Check for 404 indicator (adjust based on your actual 404 page content)
		const notFoundIndicator = page.getByText(/not found|404/i);
		await expect(notFoundIndicator).toBeVisible();
	});
});

test.describe("Responsive Design", () => {
	test("should be responsive on mobile viewport", async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("/");
		await page.waitForLoadState("networkidle");

		// Main content should still be visible
		const main = page.locator("main");
		await expect(main).toBeVisible();
	});

	test("should be responsive on tablet viewport", async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto("/");
		await page.waitForLoadState("networkidle");

		const main = page.locator("main");
		await expect(main).toBeVisible();
	});
});

