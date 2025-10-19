import posthog from "posthog-js";

const host = process.env.NODE_ENV === "production" ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : `http://localhost:3001`;

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: `${host}/ocw-path-for-stuff`,
  ui_host: `${host}/ocw-path-for-stuff`,
  defaults: "2025-05-24",
  person_profiles: "always",
});