import posthog from "posthog-js";
import { env } from "./env";

posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
	api_host: "/ocw-path-for-real",
	ui_host: "https://us.posthog.com",
	defaults: "2025-05-24",
	person_profiles: "always",
	capture_exceptions: true, // This enables capturing exceptions using Error Tracking
	debug: env.NODE_ENV === "development",
});
