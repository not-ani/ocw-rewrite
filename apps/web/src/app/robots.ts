import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/multi-tenant/server";

export default async function robots(): Promise<MetadataRoute.Robots> {
	const baseUrl = await getBaseUrl();

	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: [
					"/admin/",
					"/api/",
					"/course/*/dashboard/",
					"/ocw-admin/",
					"/ocw-path-for-stuff/",
					"/_next/",
					"/unauthorized/",
				],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}

