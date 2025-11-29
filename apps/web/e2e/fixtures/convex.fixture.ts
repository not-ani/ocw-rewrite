/**
 * Convex Fixtures for E2E Tests
 *
 * Provides utilities for interacting with Convex during E2E tests.
 * This allows seeding test data and cleaning up after tests.
 */

import { test as base } from "@playwright/test";
import type { FunctionReference } from "convex/server";

/**
 * Configuration for Convex test client.
 * Uses environment variables that should match your Convex dev deployment.
 */
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

/**
 * Extended test fixture that provides Convex interaction utilities.
 */
export const test = base.extend<{
	/**
	 * Execute a Convex mutation or action for test setup/teardown.
	 * This is useful for seeding test data or cleaning up.
	 *
	 * Note: This requires your Convex backend to have test-specific
	 * mutations exposed (ideally guarded by a test environment check).
	 */
	convexClient: {
		runMutation: <Args extends Record<string, unknown>>(
			functionName: string,
			args: Args
		) => Promise<unknown>;
		runQuery: <Args extends Record<string, unknown>>(
			functionName: string,
			args: Args
		) => Promise<unknown>;
	};
}>({
	convexClient: async ({ page }, use) => {
		const convexClient = {
			/**
			 * Run a Convex mutation by calling an API endpoint.
			 * Your Next.js app should expose a test API route for this.
			 */
			runMutation: async <Args extends Record<string, unknown>>(
				functionName: string,
				args: Args
			): Promise<unknown> => {
				// Option 1: Call a test API endpoint in your Next.js app
				const response = await page.request.post("/api/test/convex", {
					data: { type: "mutation", functionName, args },
				});

				if (!response.ok()) {
					throw new Error(
						`Failed to run mutation ${functionName}: ${await response.text()}`
					);
				}

				return response.json();
			},

			/**
			 * Run a Convex query by calling an API endpoint.
			 */
			runQuery: async <Args extends Record<string, unknown>>(
				functionName: string,
				args: Args
			): Promise<unknown> => {
				const response = await page.request.post("/api/test/convex", {
					data: { type: "query", functionName, args },
				});

				if (!response.ok()) {
					throw new Error(
						`Failed to run query ${functionName}: ${await response.text()}`
					);
				}

				return response.json();
			},
		};

		await use(convexClient);
	},
});

/**
 * Test data IDs tracked for cleanup.
 * Add IDs here during test setup, then clean up in afterAll.
 */
export interface TestDataTracker {
	courseIds: string[];
	unitIds: string[];
	lessonIds: string[];
}

export function createTestDataTracker(): TestDataTracker {
	return {
		courseIds: [],
		unitIds: [],
		lessonIds: [],
	};
}

/**
 * Schools/subdomains to use in E2E tests.
 * These should match the sites configured in your Convex dev database.
 */
export const E2E_TEST_SCHOOLS = {
	PRIMARY: process.env.E2E_TEST_SCHOOL || "test-school",
} as const;

