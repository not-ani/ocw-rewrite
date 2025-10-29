import { api } from "@ocw/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { extractSubdomain } from "@/lib/multi-tenant/server";

export async function generateMetadata(): Promise<Metadata> {
	const subdomain = await extractSubdomain();

	if (!subdomain) {
		return {
			title: "About Us",
			description: "Learn about our mission and values",
		};
	}

	const siteConfig = await fetchQuery(api.site.getSiteConfig, {
		school: subdomain,
	});

	return {
		title: `About Us | ${siteConfig?.schoolName ?? "OpenCourseWare"}`,
		description: `Learn about ${siteConfig?.schoolName ?? "OpenCourseWare"} and our mission to provide free, high-quality educational resources.`,
	};
}

export default async function Page() {
	const subdomain = await extractSubdomain();

	if (!subdomain) {
		return null;
	}

	const siteConfig = await fetchQuery(api.site.getSiteConfig, {
		school: subdomain,
	});

	return (
		<div className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-4xl">
				<h1 className="mb-8 text-center font-bold text-3xl text-foreground tracking-tight">
					About Us
				</h1>
				<div className="space-y-6 text-foreground">
					<p className="leading-relaxed">
						{siteConfig?.schoolName} OpenCourseWare (OCW) is dedicated to
						providing free, high-quality resources to students at{" "}
						{siteConfig?.schoolName}. Our platform offers a wide range of
						courses, notes, and tools to help students achieve their academic
						goals.
					</p>
					<p className="leading-relaxed">
						As students who are always invested in helping others learn—often
						from resources we created ourselves—{siteConfig?.schoolName}OCW is
						our way of facilitating a larger proliferation of the best of these
						resources. In general and at {siteConfig?.schoolName}, sharing
						knowledge heightens the character of our academics, accelerates the
						pace of our learning, and deepens the level of our understanding.
					</p>
					<br />
					<h1 className="mb-8 text-center font-bold text-3xl tracking-tight">
						Our Mission
					</h1>
					<p className="leading-relaxed">
						We believe that by enhancing student learning, OCW will help reduce
						the temptation to cheat, plagiarize, and cut corners. Our goal is to
						provide students with the resources they need to succeed
						academically and to alleviate academic stress.
					</p>
					<p className="leading-relaxed">
						If you have any questions or would like to learn more about our
						platform, please feel free to{" "}
						<Link
							className="text-blue-600 hover:text-blue-800 hover:underline"
							href="/contact"
						>
							contact us
						</Link>
						.
					</p>
				</div>
			</div>
		</div>
	);
}
