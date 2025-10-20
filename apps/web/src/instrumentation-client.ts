import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/ocw-path-for-stuff`,
  ui_host: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/ocw-path-for-stuff`,
  defaults: "2025-05-24",
  person_profiles: "always",
});
