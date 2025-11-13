import { api } from "@ocw/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { AdminPageClient } from "./client";

export async function generateMetadata(): Promise<Metadata> {
	const subdomain = await extractSubdomain();

	if (!subdomain) {
		return {
			title: "Admin",
			description: "Admin dashboard",
		};
	}

	const siteConfig = await fetchQuery(api.site.getSiteConfig, {
		school: subdomain,
	});

	return {
		title: `Admin Dashboard | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
		description: `Manage courses, users, and site settings for ${siteConfig?.schoolName ?? "OpenCourseWare"}.`,
	};
}

export default async function AdminPage() {
	const token = await getAuthToken();
	const subdomain = await extractSubdomain();

	if (!subdomain) {
		redirect("/");
	}

	if (!token) {
		redirect("/");
	}

	const isSiteAdmin = await fetchQuery(
		api.admin.isSiteAdmin,
		{ school: subdomain },
		{ token },
	);

	if (!isSiteAdmin) {
		redirect("/");
	}

	return (
		<div className="min-h-screen bg-background">
			<AdminPageClient subdomain={subdomain} />
		</div>
	);
}
