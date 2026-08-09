import { getCourseMetadata, renderCoursePage } from "@/app/course/[id]/page";
import { getTenantBaseUrl } from "@/lib/site";

type Params = { domain: string; id: string };

export async function generateMetadata({
	params,
}: {
	params: Promise<Params>;
}) {
	const { domain, id } = await params;
	return getCourseMetadata(domain, id, getTenantBaseUrl(domain));
}

export default async function Page({ params }: { params: Promise<Params> }) {
	const { domain, id } = await params;
	return renderCoursePage(domain, id);
}
