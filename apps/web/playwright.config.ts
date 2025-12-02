import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for E2E Tests
 *
 * This config integrates:
 * - Clerk authentication via @clerk/testing/playwright
 * - Convex backend (tests run against your dev deployment)
 * - Next.js app server (local) OR Vercel preview deployments
 *
 * Environment Variables:
 * - E2E_BASE_URL: Override the base URL for tests. Useful for:
 *   - Local multi-tenant testing: http://test-school.localhost:3001
 *   - Vercel preview deployments: https://your-project-xxx.vercel.app
 *
 * Auth Setup:
 * - global.setup.ts creates auth states for USER, ADMIN, and EDITOR
 * - Tests use `test.use({ storageState: ... })` to specify which user they need
 * - This avoids calling clerk.signIn() repeatedly which can cause rate limiting
 *
 * @see https://clerk.com/docs/guides/development/testing/playwright/overview
 * @see https://clerk.com/docs/guides/development/testing/playwright/test-authenticated-flows
 */

/**
 * Determine if we're testing against an external URL (e.g., Vercel preview)
 * vs a local development server.
 */
function isExternalUrl(): boolean {
	const baseUrl = process.env.E2E_BASE_URL;
	if (!baseUrl) return false;

	// Check if the URL is not localhost
	try {
		const url = new URL(baseUrl);
		return (
			!url.hostname.includes("localhost") && !url.hostname.includes("127.0.0.1")
		);
	} catch {
		return false;
	}
}

/**
 * Build the test base URL.
 *
 * Priority:
 * 1. E2E_BASE_URL environment variable (for Vercel preview or custom URLs)
 * 2. Default to local multi-tenant test URL
 */
function getTestBaseUrl(): string {
	const baseUrl =
		process.env.E2E_BASE_URL || "http://test-school.localhost:3001";

	try {
		const url = new URL(baseUrl);
		return url.origin;
	} catch {
		// If URL parsing fails, return as-is
		return baseUrl;
	}
}

/**
 * Get the webserver configuration.
 * Skip starting a local server if testing against an external URL (Vercel preview).
 */
function getWebServerConfig() {
	// Don't start a local server if testing against Vercel preview or other external URL
	if (isExternalUrl()) {
		console.log(`🌐 Testing against external URL: ${process.env.E2E_BASE_URL}`);
		console.log("   Skipping local server startup.");
		return undefined;
	}

	// Start local dev server for local testing
	return {
		// For local development, start the server separately with `pnpm dev` from the project root.
		// This command is mainly for CI where we need to start the server automatically.
		command: "npx next dev --port=3001",
		url: "http://localhost:3001",
		// Reuse existing server in local dev - make sure to run `pnpm dev` before tests
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
		env: {
			NODE_ENV: "test",
		},
		// In local dev, if no server is running, show a helpful error
		stderr: "pipe" as const,
		stdout: "pipe" as const,
	};
}

export default defineConfig({
	testDir: "./e2e",
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 5 : undefined,
	/* Reporter to use. */
	reporter: [["html", { outputFolder: "e2e-report" }], ["list"]],
	/* Shared settings for all the projects below. */
	use: {
		/* Base URL - supports local multi-tenant or Vercel preview deployments */
		baseURL: getTestBaseUrl(),
		/* Collect trace when retrying the failed test. */
		trace: "on-first-retry",
		/* Take screenshot on failure */
		screenshot: "only-on-failure",
		/* Video recording on failure */
		video: "retain-on-failure",
	},

	/* Configure projects for major browsers */
	projects: [
		// Global setup project - runs Clerk setup and creates auth states for all user types
		// @see https://clerk.com/docs/guides/development/testing/playwright/test-authenticated-flows
		{
			name: "global setup",
			testMatch: /global\.setup\.ts/,
		},

		/**
		 * Authenticated tests - tests that require authentication.
		 * Tests matching *.authenticated.spec.ts specify their auth state via test.use().
		 *
		 * @example
		 * ```ts
		 * // e2e/tests/admin.authenticated.spec.ts
		 * import { test, ADMIN_AUTH_STATE } from "../fixtures";
		 * test.use({ storageState: ADMIN_AUTH_STATE });
		 *
		 * test("admin can access admin panel", async ({ page }) => {
		 *   // Already authenticated as ADMIN
		 *   await page.goto("/admin");
		 * });
		 * ```
		 */
		{
			name: "authenticated",
			testMatch: /.*\.authenticated\.spec\.ts/,
			use: {
				...devices["Desktop Chrome"],
				// Note: Individual test files/describes set their own storageState
				// via test.use({ storageState: USER_AUTH_STATE | ADMIN_AUTH_STATE | EDITOR_AUTH_STATE })
			},
			dependencies: ["global setup"],
		},

		// Standard browser projects - exclude authenticated tests to avoid redundant runs
		{
			name: "chromium",
			testIgnore: /.*\.authenticated\.spec\.ts/,
			use: { ...devices["Desktop Chrome"] },
			dependencies: ["global setup"],
		},
	],

	/* Run your local dev server before starting the tests */
	webServer: getWebServerConfig(),
});
