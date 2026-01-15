import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { redirect } from "next/navigation";
import { checkAdminOrEditorPermission } from "@/lib/permissions";
import { isValidConvexId } from "@/lib/convex-utils";
import { extractSubdomain } from "@/lib/multi-tenant/server";

export default async function SettingsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const subdomain = await extractSubdomain();

	if (!subdomain || !isValidConvexId(id)) {
		return null;
	}

	const { authorized } = await checkAdminOrEditorPermission(
		id as Id<"courses">,
	);

	if (!authorized) {
		redirect("/unauthorized");
	}

	return (
		<div>
			<h1>Settings</h1>
		</div>
	);
}
