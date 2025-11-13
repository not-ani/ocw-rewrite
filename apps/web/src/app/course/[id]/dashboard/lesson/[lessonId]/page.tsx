import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { notFound } from "next/navigation";
import { isValidConvexId } from "@/lib/convex-utils";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { LessonPageClient } from "./client";

export default async function LessonPage({
	params,
}: {
	params: Promise<{ id: string; lessonId: string }>;
}) {
	const { id, lessonId } = await params;
	const subdomain = await extractSubdomain();

	if (!subdomain) {
		notFound();
	}

	if (!isValidConvexId(id) || !isValidConvexId(lessonId)) {
		notFound();
	}

	const courseId = id as Id<"courses">;

	return (
		<LessonPageClient
			courseId={courseId}
			lessonId={lessonId as Id<"lessons">}
			subdomain={subdomain}
		/>
	);
}
