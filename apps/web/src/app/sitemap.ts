import type { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { extractSubdomain, getBaseUrl } from "@/lib/multi-tenant/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [subdomain, baseUrl] = await Promise.all([
        extractSubdomain(),
        getBaseUrl(),
    ]);
	
	const entries: MetadataRoute.Sitemap = [];

	// If no subdomain, return root domain routes only
	if (!subdomain) {
		entries.push(
			{
				url: baseUrl,
				lastModified: new Date(),
				changeFrequency: "daily",
				priority: 1,
			},
            {
                url: `${baseUrl}/analytics`,
                lastModified: new Date(),
                changeFrequency: "daily",
                priority: 0.9,
            }
			
		);
		return entries;
	}

	// For subdomains, fetch all public courses and their content
	try {
		// Get all public courses for this subdomain
		const coursesData = await fetchQuery(api.courses.getPaginatedCourses, {
			page: 1,
			limit: 1000, // Get all courses
			search: "",
			school: subdomain,
		});

		const courses = coursesData?.courses || [];

		// Add subdomain landing page
		entries.push({
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		});

		// Add marketing pages
		entries.push(
			{
				url: `${baseUrl}/courses`,
				lastModified: new Date(),
				changeFrequency: "daily",
				priority: 0.9,
			},
			{
				url: `${baseUrl}/about`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.8,
			},
			{
				url: `${baseUrl}/contact`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.7,
			},
			{
				url: `${baseUrl}/contribute`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.8,
			},
			{
				url: `${baseUrl}/contributors`,
				lastModified: new Date(),
				changeFrequency: "weekly",
				priority: 0.7,
			},
			{
				url: `${baseUrl}/teachers`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.7,
			},
		);

		// Add course pages and their units/lessons
		for (const course of courses) {
			if (!course.isPublic) continue;

			// Add course main page
			entries.push({
				url: `${baseUrl}/course/${course._id}`,
				lastModified: course._creationTime
					? new Date(course._creationTime)
					: new Date(),
				changeFrequency: "weekly",
				priority: 0.9,
			});

			// Fetch course with units and lessons
			try {
				const courseWithContent = await fetchQuery(
					api.courses.getCourseWithUnitsAndLessons,
					{
						id: course._id as Id<"courses">,
						school: subdomain,
					},
				);

				if (courseWithContent?.units) {
					for (const unit of courseWithContent.units) {
						// Add unit page
						entries.push({
							url: `${baseUrl}/course/${course._id}/${unit.id}`,
							lastModified: new Date(),
							changeFrequency: "weekly",
							priority: 0.8,
						});

						// Add lesson pages
						if (unit.lessons) {
							for (const lesson of unit.lessons) {
								entries.push({
									url: `${baseUrl}/course/${course._id}/${unit.id}/${lesson.id}`,
									lastModified: new Date(),
									changeFrequency: "weekly",
									priority: 0.7,
								});
							}
						}
					}
				}
			} catch (error) {
				// Skip courses that fail to load (might be private or deleted)
				console.error(
					`Failed to load course ${course._id} for sitemap:`,
					error,
				);
			}
		}
	} catch (error) {
		// If fetching courses fails, at least return the basic pages
		console.error("Failed to fetch courses for sitemap:", error);
		entries.push({
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		});
	}

	return entries;
}

