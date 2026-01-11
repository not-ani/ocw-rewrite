import { PostHog } from "posthog-node";
import { env } from "@/env";

let posthogInstance = null;

export function getPostHogServer() {
  posthogInstance ??= new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });

  return posthogInstance;
}
