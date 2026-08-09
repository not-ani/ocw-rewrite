import { fetchQuery } from "convex/nextjs";
import { cacheLife } from "next/cache";
import { connection } from "next/server";

import { getTenantBaseUrl } from "@/lib/site";
import { api } from "@ocw/backend/convex/_generated/api";

async function getPublicSitemapData(school: string) {
	"use cache";
	cacheLife({ stale: 300, revalidate: 300, expire: 3600 });
	return fetchQuery(api.sitemap.getPublicSitemapData, { school });
}

function entry(
	url: string,
	changeFrequency: string,
	priority: number,
	updatedAt?: number,
) {
	return `<url><loc>${url}</loc>${updatedAt ? `<lastmod>${new Date(updatedAt).toISOString()}</lastmod>` : ""}<changefreq>${changeFrequency}</changefreq><priority>${priority}</priority></url>`;
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ domain: string }> },
) {
	const { domain } = await params;
	await connection();
	const baseUrl = getTenantBaseUrl(domain);
	const data = await getPublicSitemapData(domain);
	const entries = [
		entry(baseUrl, "daily", 1),
		entry(`${baseUrl}/courses`, "daily", 0.9),
		entry(`${baseUrl}/about`, "monthly", 0.8),
		entry(`${baseUrl}/contact`, "monthly", 0.7),
		entry(`${baseUrl}/contribute`, "monthly", 0.8),
		entry(`${baseUrl}/contributors`, "weekly", 0.7),
		entry(`${baseUrl}/teachers`, "monthly", 0.7),
		...data.courses.map((course) =>
			entry(`${baseUrl}/course/${course.id}`, "weekly", 0.9, course.updatedAt),
		),
		...data.units.map((unit) =>
			entry(
				`${baseUrl}/course/${unit.courseId}/${unit.id}`,
				"weekly",
				0.8,
				unit.updatedAt,
			),
		),
		...data.lessons.map((lesson) =>
			entry(
				`${baseUrl}/course/${lesson.courseId}/${lesson.unitId}/${lesson.id}`,
				"weekly",
				0.7,
				lesson.updatedAt,
			),
		),
	];

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join("")}</urlset>`,
		{ headers: { "Content-Type": "application/xml; charset=utf-8" } },
	);
}
