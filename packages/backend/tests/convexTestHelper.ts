/**
 * Convex Test Helper
 *
 * This module provides a pre-configured convexTest function that works
 * in the monorepo structure by explicitly passing the modules.
 */

import { convexTest } from "convex-test";
import schema from "../convex/schema";

// Import all Convex function modules from the convex directory
// @ts-expect-error - import.meta.glob is a Vite feature
const modules = import.meta.glob("../convex/**/*.*s", {
	eager: false,
});

/**
 * Creates a convex test instance with all modules pre-loaded.
 * Use this instead of calling convexTest(schema) directly.
 */
export function createConvexTest() {
	return convexTest(schema, modules);
}
