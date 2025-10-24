import { Suspense } from "react";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { CoursesPage } from "./client";

export default async function Page() {
	const subdomain = await extractSubdomain();

	if (!subdomain) {
		return <div>No subdomain found</div>;
	}

	return (
		<Suspense>
			<CoursesPage subdomain={subdomain} />
		</Suspense>
	);
}
