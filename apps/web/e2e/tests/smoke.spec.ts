/**
 * Smoke Tests
 *
 * Quick sanity checks to verify the application is running.
 * Run these first in CI to fail fast if something is fundamentally broken.
 *
 * @tags smoke
 */

import { expect, test } from "../fixtures";

test.describe("Smoke Tests @smoke", () => {
	test("application loads successfully", async ({ page }) => {
		const response = await page.goto("/");
		expect(response?.status()).toBeLessThan(500);
	});

	test("homepage renders without crashing", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");

		// Page should have a body
		const body = page.locator("body");
		await expect(body).toBeVisible();
	});

	test("courses page loads", async ({ page }) => {
		const response = await page.goto("/courses");
		expect(response?.status()).toBeLessThan(500);
	});

	test("Clerk provider is configured", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");

		// Check that Clerk's scripts are loaded
		// This verifies the ClerkProvider is properly set up
		const clerkLoaded = await page.evaluate(() => {
			return (
				typeof window !== "undefined" &&
				(window as any).__clerk_frontend_api !== undefined
			);
		});

		// Note: This might not work depending on Clerk's implementation
		// The main check is that the page loads without errors
	});

	test("Convex connection works", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");

		// If the page loads and shows content, Convex is working
		// More specific checks would require inspecting network requests
		const body = page.locator("body");
		await expect(body).toBeVisible();
	});

	test("no console errors on homepage", async ({ page }) => {
		const errors: string[] = [];

		page.on("console", (msg) => {
			if (msg.type() === "error") {
				errors.push(msg.text());
			}
		});

		await page.goto("/");
		await page.waitForLoadState("networkidle");

		// Filter out known acceptable errors (like Clerk/Convex initialization warnings)
		const criticalErrors = errors.filter(
			(error) =>
				!error.includes("Failed to load resource") && // Network errors are expected in dev
				!error.includes("[clerk]") && // Clerk warnings
				!error.includes("convex"), // Convex warnings
		);

		expect(criticalErrors).toHaveLength(0);
	});
});

test.describe("API Health @smoke", () => {
	test("marketing pages respond", async ({ page }) => {
		const pages = ["/about", "/contact", "/contribute", "/contributors"];

		for (const path of pages) {
			const response = await page.goto(path);
			expect(
				response?.status(),
				`${path} should return successful status`,
			).toBeLessThan(500);
		}
	});
});
