import { getTenantBaseUrl } from "@/lib/site";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ domain: string }> },
) {
	const { domain } = await params;
	return new Response(
		[
			"User-Agent: *",
			"Allow: /",
			"Disallow: /admin/",
			"Disallow: /api/",
			"Disallow: /course/*/dashboard/",
			"Disallow: /ocw-path-for-real/",
			"Disallow: /_next/",
			`Sitemap: ${getTenantBaseUrl(domain)}/sitemap.xml`,
		].join("\n"),
		{ headers: { "Content-Type": "text/plain; charset=utf-8" } },
	);
}
