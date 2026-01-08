import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    CORS_ORIGIN: z.url(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    CLERK_SECRET_KEY: z.string(),
    PROJECT_ID: z.string(),
    PERSONAL_ACCESS_API_KEY: z.string(),
    UPLOADTHING_TOKEN: z.string(),
    CLERK_JWT_ISSUER_DOMAIN: z.string().optional(),
    ALLOWED_HOSTS: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
