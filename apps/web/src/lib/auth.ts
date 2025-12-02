import "server-only";

import { auth } from "@clerk/nextjs/server";
import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

export async function getAuthToken() {
	return (await (await auth()).getToken({ template: "convex" })) ?? undefined;
}

export async function checkAdminOrEditorPermission(
	courseId: Id<"courses">,
	subdomain: string,
): Promise<void> {
	const token = await getAuthToken();
	if (!token) {
		return redirect("/unauthorized");
	}

	const [isSiteAdmin, membership] = await Promise.all([
		fetchQuery(api.admin.isSiteAdmin, { school: subdomain }, { token }),
		fetchQuery(
			api.courseUsers.getMyMembership,
			{ courseId: courseId as Id<"courses">, school: subdomain },
			{ token },
		),
	]);

	const isAuthorized =
		isSiteAdmin ||
		membership?.role === "admin" ||
		membership?.role === "editor";

	if (!isAuthorized) {
		return redirect("/unauthorized");
	}

}
