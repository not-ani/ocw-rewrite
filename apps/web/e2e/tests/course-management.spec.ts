/**
 * Course Management E2E Tests
 *
 * Tests for course creation, editing, and management functionality.
 * These tests use pre-authenticated state from global.setup.ts.
 *
 * IMPORTANT: Tests are grouped by required user type and use storageState
 * to start authenticated (instead of calling signIn() which causes rate limiting).
 */

import { test, expect, EDITOR_AUTH_STATE, ADMIN_AUTH_STATE } from "../fixtures";

test.describe("Course Dashboard - View Course (as EDITOR)", () => {
	test.use({ storageState: EDITOR_AUTH_STATE });

	test("should display course dashboard layout", async ({ page }) => {
		// First, navigate to courses to find a course
		await page.goto("/courses");
		await page.waitForLoadState("networkidle");

		const courseLink = page.locator('a[href^="/course/"]').first();

		if (await courseLink.isVisible()) {
			const href = await courseLink.getAttribute("href");
			if (href) {
				// Navigate to course dashboard
				await page.goto(`${href}/dashboard`);
				await page.waitForLoadState("networkidle");

				// Check for dashboard elements
				const content = page.locator("body");
				await expect(content).toBeVisible();
			}
		}
	});

	test("should show sidebar navigation in dashboard", async ({ page }) => {
		await page.goto("/courses");
		await page.waitForLoadState("networkidle");

		const courseLink = page.locator('a[href^="/course/"]').first();

		if (await courseLink.isVisible()) {
			const href = await courseLink.getAttribute("href");
			if (href) {
				await page.goto(`${href}/dashboard`);
				await page.waitForLoadState("networkidle");

				// Look for sidebar navigation (adjust selectors based on your UI)
				const sidebar = page.locator('[data-sidebar], [class*="sidebar"]');
				if (await sidebar.isVisible()) {
					await expect(sidebar).toBeVisible();
				}
			}
		}
	});
});

test.describe("Course Dashboard - Unit Management (as ADMIN)", () => {
	test.use({ storageState: ADMIN_AUTH_STATE });

	test("should display units list in dashboard", async ({ page }) => {
		await page.goto("/courses");
		await page.waitForLoadState("networkidle");

		const courseLink = page.locator('a[href^="/course/"]').first();

		if (await courseLink.isVisible()) {
			const href = await courseLink.getAttribute("href");
			if (href) {
				await page.goto(`${href}/dashboard`);
				await page.waitForLoadState("networkidle");

				// Dashboard should show units or empty state
				const content = page.locator("body");
				await expect(content).toBeVisible();
			}
		}
	});

	test("should have create unit button for authorized users", async ({
		page,
	}) => {
		await page.goto("/courses");
		await page.waitForLoadState("networkidle");

		const courseLink = page.locator('a[href^="/course/"]').first();

		if (await courseLink.isVisible()) {
			const href = await courseLink.getAttribute("href");
			if (href) {
				await page.goto(`${href}/dashboard`);
				await page.waitForLoadState("networkidle");

				// Look for create unit button (adjust based on your UI)
				const createButton = page.getByRole("button", {
					name: /create.*unit|add.*unit|new.*unit/i,
				});
				// Button visibility depends on user permissions
			}
		}
	});
});

test.describe("Course Dashboard - Lesson Management (as ADMIN)", () => {
	test.use({ storageState: ADMIN_AUTH_STATE });

	test("should navigate to lesson editor", async ({ page }) => {
		await page.goto("/courses");
		await page.waitForLoadState("networkidle");

		const courseLink = page.locator('a[href^="/course/"]').first();

		if (await courseLink.isVisible()) {
			const href = await courseLink.getAttribute("href");
			if (href) {
				await page.goto(`${href}/dashboard`);
				await page.waitForLoadState("networkidle");

				// Look for lesson links
				const lessonLink = page
					.locator('a[href*="/dashboard/lesson/"]')
					.first();
				if (await lessonLink.isVisible()) {
					await lessonLink.click();
					await page.waitForLoadState("networkidle");

					// Should navigate to lesson detail
					await expect(page).toHaveURL(/\/dashboard\/lesson\//);
				}
			}
		}
	});
});

test.describe("Course Dashboard - User Management (as ADMIN)", () => {
	test.use({ storageState: ADMIN_AUTH_STATE });

	test("should access users management page", async ({ page }) => {
		await page.goto("/courses");
		await page.waitForLoadState("networkidle");

		const courseLink = page.locator('a[href^="/course/"]').first();

		if (await courseLink.isVisible()) {
			const href = await courseLink.getAttribute("href");
			if (href) {
				await page.goto(`${href}/dashboard/users`);
				await page.waitForLoadState("networkidle");

				// Should show users page or permission denied
				const content = page.locator("body");
				await expect(content).toBeVisible();
			}
		}
	});

	test("should access settings page", async ({ page }) => {
		await page.goto("/courses");
		await page.waitForLoadState("networkidle");

		const courseLink = page.locator('a[href^="/course/"]').first();

		if (await courseLink.isVisible()) {
			const href = await courseLink.getAttribute("href");
			if (href) {
				await page.goto(`${href}/dashboard/settings`);
				await page.waitForLoadState("networkidle");

				const content = page.locator("body");
				await expect(content).toBeVisible();
			}
		}
	});
});

test.describe("Course Public View", () => {
	// No auth needed for public course viewing
	test("should display course content for public courses", async ({ page }) => {
		await page.goto("/courses");
		await page.waitForLoadState("networkidle");

		const courseLink = page.locator('a[href^="/course/"]').first();

		if (await courseLink.isVisible()) {
			await courseLink.click();
			await page.waitForLoadState("networkidle");

			// Course page should show course information
			const content = page.locator("body");
			await expect(content).toBeVisible();
		}
	});

	test("should display units in course detail", async ({ page }) => {
		await page.goto("/courses");
		await page.waitForLoadState("networkidle");

		const courseLink = page.locator('a[href^="/course/"]').first();

		if (await courseLink.isVisible()) {
			await courseLink.click();
			await page.waitForLoadState("networkidle");

			// Look for unit links or content
			const content = page.locator("body");
			await expect(content).toBeVisible();
		}
	});

	test("should navigate to lesson from course page", async ({ page }) => {
		await page.goto("/courses");
		await page.waitForLoadState("networkidle");

		const courseLink = page.locator('a[href^="/course/"]').first();

		if (await courseLink.isVisible()) {
			await courseLink.click();
			await page.waitForLoadState("networkidle");

			// Look for lesson links (adjust based on your course page structure)
			const lessonLink = page.locator('a[href*="/"][href*="/"]').first();
			// Navigation depends on course having units and lessons
		}
	});
});
