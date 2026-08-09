import {
	getUnitMetadata,
	renderUnitPage,
} from "@/app/course/[id]/[unitId]/page";
import { getTenantBaseUrl } from "@/lib/site";

type Params = { domain: string; id: string; unitId: string };

export async function generateMetadata({
	params,
}: {
	params: Promise<Params>;
}) {
	const { domain, id, unitId } = await params;
	return getUnitMetadata(domain, id, unitId, getTenantBaseUrl(domain));
}

export default async function Page({ params }: { params: Promise<Params> }) {
	const { domain, unitId } = await params;
	return renderUnitPage(domain, unitId);
}
