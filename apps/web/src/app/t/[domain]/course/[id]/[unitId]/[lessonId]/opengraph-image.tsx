import { renderLessonOpenGraphImage } from "@/app/course/[id]/[unitId]/[lessonId]/opengraph-image";

export const alt = "OpenCourseWare";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";
export const revalidate = 3600;

export default async function Image({
	params,
}: {
	params: Promise<{
		domain: string;
		id: string;
		unitId: string;
		lessonId: string;
	}>;
}) {
	const { domain, unitId, lessonId } = await params;
	return renderLessonOpenGraphImage(domain, unitId, lessonId);
}
