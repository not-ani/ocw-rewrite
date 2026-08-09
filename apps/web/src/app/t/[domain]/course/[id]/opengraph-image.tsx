import { renderCourseOpenGraphImage } from "@/app/course/[id]/opengraph-image";

export const alt = "OpenCourseWare";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
	params,
}: {
	params: Promise<{ domain: string; id: string }>;
}) {
	const { domain, id } = await params;
	return renderCourseOpenGraphImage(domain, id);
}
