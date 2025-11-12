import type React from "react";
import { Suspense } from "react";
import { EditButton } from "@/components/edit-button";

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
