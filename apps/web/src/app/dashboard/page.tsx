import { api } from "@ocw/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { DashboardClient } from "./client";

export async function generateMetadata(): Promise<Metadata> {
	const subdomain = await extractSubdomain();

	if (!subdomain) {
		return {
			title: "Dashboard",
			description: "Your personal dashboard",
		};
	}

	const siteConfig = await fetchQuery(api.site.getSiteConfig, {
		school: subdomain,
	});

	return {
		title: `Dashboard | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
		description: "Your personal dashboard and learning progress.",
	};
}

export default function Dashboard() {
	return <DashboardClient />;
}
