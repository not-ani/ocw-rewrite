import { fetchQuery } from "convex/nextjs";
import { unstable_cache } from "next/cache";

import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";

// Public catalog data only. Primitive arguments are included in each cache key,
// preventing tenant data from being shared between schools.
export const getPublicSiteConfig = unstable_cache(
	async (school: string) => fetchQuery(api.site.getSiteConfig, { school }),
	["public-site-config"],
	{ revalidate: 300 },
);

export const getPublicSites = unstable_cache(
	async () => fetchQuery(api.site.getSites),
	["public-sites"],
	{ revalidate: 3600 },
);

export const getPublicCourse = unstable_cache(
	async (school: string, courseId: Id<"courses">) =>
		fetchQuery(api.courses.getCourseById, { school, courseId }),
	["public-course"],
	{ revalidate: 60 },
);

export const getPublicUnit = unstable_cache(
	async (school: string, id: Id<"units">) =>
		fetchQuery(api.units.getPublicById, { school, id }),
	["public-unit"],
	{ revalidate: 60 },
);

export const getPublicLesson = unstable_cache(
	async (school: string, id: Id<"lessons">) =>
		fetchQuery(api.lesson.getPublicLessonById, { school, id }),
	["public-lesson"],
	{ revalidate: 60 },
);
