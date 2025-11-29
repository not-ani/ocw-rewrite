/**
 * Convex Test Helper
 *
 * This module provides a pre-configured convexTest function that works
 * in the monorepo structure by explicitly passing the modules.
 */

import { convexTest } from "convex-test";
import schema from "../schema";

// Import all Convex function modules from the convex directory
// Excludes test files and _generated directory
//@ts-expect-error - import.meta.glob is not available in Node.js
const modules = import.meta.glob("../**/*.*s", {
	eager: false,
});

/**
 * Creates a convex test instance with all modules pre-loaded.
 * Use this instead of calling convexTest(schema) directly.
 */
export function createConvexTest() {
	return convexTest(schema, modules);
}

