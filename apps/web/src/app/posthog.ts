import { PostHog } from "posthog-node";

const host = process.env.NODE_ENV === "production" ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : `http://localhost:3001`;

export default function PostHogClient() {
  const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: `${host}/ocw-path-for-stuff`,
    flushAt: 1,
    flushInterval: 0,
  });
  return posthogClient;
}
