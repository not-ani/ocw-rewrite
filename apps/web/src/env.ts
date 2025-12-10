import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod/v4";
/**
 *
NEXT_PUBLIC_CONVEX_URL=""
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=""
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST=""
PROJECT_ID=""
PERSONAL_ACCESS_API_KEY=""
**/

export const env = createEnv({
	extends: [vercel()],
	shared: {
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
	},
	/**
	 * Specify your server-side environment variables schema here.
	 * This way you can ensure the app isn't built with invalid env vars.
	 */
	server: {
		CLERK_SECRET_KEY: z.string(),
		PROJECT_ID: z.string(),
		PERSONAL_ACCESS_API_KEY: z.string(),
		RAILWAY_ACCESS_KEY: z.string(),
		RAILWAY_BUCKET: z.string(),
		RAILWAY_ENDPOINT: z.string(),
		RAILWAY_SECRET_KEY: z.string(),
	},

	/**
	 * Specify your client-side environment variables schema here.
	 * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
	 */
	client: {
		NEXT_PUBLIC_CLERK_FRONTEND_API_URL: z.optional(z.string()),
		NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
		NEXT_PUBLIC_POSTHOG_KEY: z.string(),
		NEXT_PUBLIC_POSTHOG_HOST: z.string(),
		NEXT_PUBLIC_CONVEX_URL: z.optional(z.string()),
	},
	/**
	 * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
	 */
	experimental__runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
		NEXT_PUBLIC_CLERK_FRONTEND_API_URL:
			process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL,
		NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
			process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
		NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
		NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
	},
	skipValidation:
		!!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
