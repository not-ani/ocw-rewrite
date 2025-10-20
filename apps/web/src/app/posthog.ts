import { PostHog } from "posthog-node";


export default function PostHogClient() {
  const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: `/ocw-path-for-stuff`,
    flushAt: 1,
    flushInterval: 0,
  });
  return posthogClient;
}
