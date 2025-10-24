import type React from "react";
import { Suspense } from "react";
import EditButton from "@/components/edit-button";

export default function Layout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ id: string }>;
}) {
	return (
		<div>
			{children}
			<Suspense>
				<EditButton params={params} />
			</Suspense>
		</div>
	);
}
