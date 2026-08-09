import { fetchQuery } from "convex/nextjs";
import { cacheLife } from "next/cache";

import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";

// Public catalog data only. Primitive arguments are included in each cache key,
// preventing tenant data from being shared between schools.
export async function getPublicSiteConfig(school: string) {
	"use cache";
	cacheLife({ stale: 300, revalidate: 300, expire: 3600 });
	return fetchQuery(api.site.getSiteConfig, { school });
}

export async function getPublicSites() {
	"use cache";
	cacheLife("hours");
	return fetchQuery(api.site.getSites);
}

export async function getPublicCourse(school: string, courseId: Id<"courses">) {
	"use cache";
	cacheLife("minutes");
	return fetchQuery(api.courses.getCourseById, { school, courseId });
}

export async function getPublicUnit(school: string, id: Id<"units">) {
	"use cache";
	cacheLife("minutes");
	return fetchQuery(api.units.getPublicById, { school, id });
}

export async function getPublicLesson(school: string, id: Id<"lessons">) {
	"use cache";
	cacheLife("minutes");
	return fetchQuery(api.lesson.getPublicLessonById, { school, id });
}
