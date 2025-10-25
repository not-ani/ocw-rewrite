"use client";

import { useSession } from "@clerk/nextjs";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogIdentify() {
	const { session } = useSession();
	const posthog = usePostHog();

	useEffect(() => {
		const user = session?.user;
		if (!user) {
			posthog.reset();
			return;
		}

		// Identify the user to PostHog
		posthog.identify(user.id, {
			email: user.primaryEmailAddress?.emailAddress,
			name: user.fullName,
		});
	}, [session?.user, posthog]);

	return null;
}
