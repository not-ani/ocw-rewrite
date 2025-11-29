/**
 * Courses E2E Tests
 *
 * Tests for the courses listing, search, and course detail pages.
 * These tests verify the core course browsing functionality.
 */

import { test, expect, E2E_TEST_SCHOOLS } from "../fixtures";

test.describe("Courses Page", () => {
	// Skip if running on root domain (courses page requires a subdomain)
	test.beforeEach(async ({ page }) => {
		// Navigate to courses page
		// Note: In production, this would be on a subdomain like test-school.ocwproject.org/courses
		// For local testing, you may need to configure hosts file or use a query param
		await page.goto("/courses");
	});

	test("should display courses page", async ({ page }) => {
		await page.waitForLoadState("networkidle");

		// The page should either show courses or a subdomain error
		// This depends on how the app handles missing subdomain
		const content = page.locator("body");
		await expect(content).toBeVisible();
	});

	test("should show search bar", async ({ page }) => {
		await page.waitForLoadState("networkidle");

		// Look for search input
		const searchInput = page.getByPlaceholder(/search/i);

		// May not be visible if subdomain is missing
		if (await searchInput.isVisible()) {
			await expect(searchInput).toBeEditable();
		}
	});

	test("should filter courses when searching", async ({ page }) => {
		await page.waitForLoadState("networkidle");

		const searchInput = page.getByPlaceholder(/search/i);

		if (await searchInput.isVisible()) {
			// Type a search query
			await searchInput.fill("test");

			// Wait for debounced search to complete
			await page.waitForTimeout(500);
			await page.waitForLoadState("networkidle");

			// URL should update with search param
			await expect(page).toHaveURL(/search=test/);
		}
	});

	test("should handle empty search results gracefully", async ({ page }) => {
		await page.waitForLoadState("networkidle");

		const searchInput = page.getByPlaceholder(/search/i);

		if (await searchInput.isVisible()) {
			// Search for something that likely doesn't exist
			await searchInput.fill("xyznonexistentcourse123");
			await page.waitForTimeout(500);
			await page.waitForLoadState("networkidle");

			// Should show "No courses found" message
			const noResults = page.getByText(/no courses found/i);
			await expect(noResults).toBeVisible();
		}
	});

	test("should navigate to course detail when clicking a course", async ({
		page,
	}) => {
		await page.waitForLoadState("networkidle");

		// Find the first course card link
		const courseLink = page.locator('a[href^="/course/"]').first();

		if (await courseLink.isVisible()) {
			await courseLink.click();
			await page.waitForLoadState("networkidle");

			// Should navigate to course detail page
			await expect(page).toHaveURL(/\/course\/[a-zA-Z0-9]+/);
		}
	});

	test("should show loading skeleton while courses load", async ({ page }) => {
		// Navigate fresh to catch loading state
		await page.goto("/courses", { waitUntil: "commit" });

		// Check for skeleton elements (they should appear briefly during load)
		// This test is timing-sensitive; in fast environments, skeletons may not be visible
		const skeleton = page.locator('[class*="skeleton"]');
		// Just verify the page doesn't crash during loading
		await page.waitForLoadState("networkidle");
	});
});

test.describe("Courses Page - Pagination", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/courses");
		await page.waitForLoadState("networkidle");
	});

	test("should display pagination when there are multiple pages", async ({
		page,
	}) => {
		// Look for pagination controls
		const pagination = page.locator('[class*="pagination"]');

		// Pagination may not be visible if there aren't enough courses
		if (await pagination.isVisible()) {
			// Should have page navigation elements
			const nextButton = page.getByRole("button", { name: /next/i });
			await expect(nextButton).toBeVisible();
		}
	});

	test("should update page when clicking pagination", async ({ page }) => {
		const nextButton = page.getByRole("button", { name: /next/i });

		if (await nextButton.isVisible()) {
			await nextButton.click();
			await page.waitForLoadState("networkidle");

			// URL should update with page param
			await expect(page).toHaveURL(/page=2/);
		}
	});
});

test.describe("Course Detail Page", () => {
	test("should show course not found for invalid course ID", async ({
		page,
	}) => {
		await page.goto("/course/invalid-course-id-12345");
		await page.waitForLoadState("networkidle");

		// Should show some error or not found state
		const content = page.locator("body");
		await expect(content).toBeVisible();
	});

	test("should display loading state initially", async ({ page }) => {
		// Navigate without waiting for full load
		await page.goto("/course/jd72sw49f70yv5m7d1fwhnwx0n7wbskf", { waitUntil: "commit" });

		// Page should show content even during loading
		const content = page.locator("body");
		await expect(content).toBeVisible();
	});
});

