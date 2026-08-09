import type { MetadataRoute } from "next";

import { protocol, rootDomain } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = `${protocol}://${rootDomain}`;
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
					"/ocw-path-for-real/",
					"/_next/",
					"/unauthorized/",
				],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
