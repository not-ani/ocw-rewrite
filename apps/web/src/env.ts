import { createEnv } from "@t3-oss/env-nextjs";
import { type } from "arktype";

/**
 * Helper predicate for URLs.
 * We refine a string to be either undefined/empty or a valid URL.
 */
/**
 * Arktype schema for env
 *
 * Notes:
 * - Using "string?" for optional strings (can be omitted).
 * - Using `"\"development\" | \"production\" | \"test\" = \"development\""`
 *   as a literal-union with default for NODE_ENV.
 * - NEXT_PUBLIC_CONVEX_URL uses the custom urlOrUndefined refinement.
 */
export const env = createEnv({
  shared: {
    NODE_ENV: type('"development" | "production" | "test" | "development"'),
  },
  client: {
    NEXT_PUBLIC_CONVEX_URL: type("string.url"), // optional URL
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: type("string > 1"), // required non-empty string
    NEXT_PUBLIC_CLERK_FRONTEND_API_URL: type("string | undefined"), // optional string
    NEXT_PUBLIC_POSTHOG_KEY: type("string > 1"),
    NEXT_PUBLIC_POSTHOG_HOST: type("string > 1"),
    NEXT_PUBLIC_ROOT_DOMAIN: type("string | undefined"),
  },
  server: {
    CLERK_SECRET_KEY: type("string > 1"),
    PROJECT_ID: type("string > 1"),
    PERSONAL_ACCESS_API_KEY: type("string > 1"),
    UPLOADTHING_TOKEN: type("string > 1"),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_FRONTEND_API_URL:
      process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_ROOT_DOMAIN: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    PROJECT_ID: process.env.PROJECT_ID,
    PERSONAL_ACCESS_API_KEY: process.env.PERSONAL_ACCESS_API_KEY,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
  },
  emptyStringAsUndefined: true,
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
