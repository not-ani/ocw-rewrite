import { renderTenantOpenGraphImage } from "@/app/(marketing)/s/[domain]/opengraph-image";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ domain: string }> },
) {
	return renderTenantOpenGraphImage((await params).domain);
}
