"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { usePostHog } from "posthog-js/react";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useSession } from "@clerk/nextjs";
import { env } from "process";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: `${env.NEXT_PUBLIC_APP_BASE_URL}/ocw-path-for-stuff`,
        ui_host: `${env.NEXT_PUBLIC_APP_BASE_URL}/ocw-path-for-stuff`,
        person_profiles: "always",
        capture_pageview: true,
      });
    }
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}

function PostHogPageView() {
  const posthog = usePostHog();

  const session = useSession();
  const data = session.session;
  useEffect(() => {
    if (data?.user?.id) {
      posthog.identify(data.user.id, {
        email: data.user.emailAddresses,
      });
    } else {
      posthog.reset();
    }
  }, [posthog, data?.user]);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + "?" + searchParams.toString();
      }

      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}
