import type { MetadataRoute } from "next";

import { protocol, rootDomain } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = `${protocol}://${rootDomain}`;
	return [
		{ url: baseUrl, changeFrequency: "daily", priority: 1 },
		{
			url: `${baseUrl}/analytics`,
			changeFrequency: "daily",
			priority: 0.9,
		},
	];
}
