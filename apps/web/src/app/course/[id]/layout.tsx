import type React from "react";
import { Suspense } from "react";

import { EditButton } from "@/components/edit-button";

// ClerkProvider currently reads the pathname above this unenumerated dynamic route.
export const instant = false;

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div>
			{children}
			<Suspense>
				<EditButton />
			</Suspense>
		</div>
	);
}
