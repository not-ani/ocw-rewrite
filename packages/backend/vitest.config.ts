import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		server: {
			deps: {
				inline: ["convex-test"],
			},
		},
		testTimeout: 15000,
		// Include test files in the convex/tests directory  
		include: ["convex/tests/**/*.test.ts"],
	},
});

