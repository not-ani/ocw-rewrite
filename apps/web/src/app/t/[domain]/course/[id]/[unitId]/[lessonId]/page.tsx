import {
	getLessonMetadata,
	renderLessonPage,
} from "@/app/course/[id]/[unitId]/[lessonId]/page";
import { getTenantBaseUrl } from "@/lib/site";

type Params = { domain: string; id: string; unitId: string; lessonId: string };

export async function generateMetadata({
	params,
}: {
	params: Promise<Params>;
}) {
	const { domain, id, unitId, lessonId } = await params;
	return getLessonMetadata(
		domain,
		id,
		unitId,
		lessonId,
		getTenantBaseUrl(domain),
	);
}

export default async function Page({ params }: { params: Promise<Params> }) {
	const { domain, id, lessonId } = await params;
	return renderLessonPage(domain, id, lessonId);
}
