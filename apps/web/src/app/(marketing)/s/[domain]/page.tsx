import { api } from "@ocw/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { HeroSection } from "@/components/hero";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ domain: string }>;
}): Promise<Metadata> {
	const { domain } = await params;

	const siteConfig = await fetchQuery(api.site.getSiteConfig, {
		school: domain,
	});

	if (!siteConfig) {
		return {
			title: "OpenCourseWare",
			description: "Free, high-quality educational resources",
		};
	}

	return {
		title: `${siteConfig.schoolName} OpenCourseWare`,
		description:
			siteConfig.siteHero ||
			`${siteConfig.schoolName} OpenCourseWare is a platform for free, high-quality resources to students at ${siteConfig.schoolName}`,
		icons: {
			icon: [
				{
					rel: "icon",
					url: siteConfig.siteLogo ?? "",
				},
			],
		},
	};
}

export default function Page() {
	return (
		<div className="w-full bg-background/60">
			<main className="flex w-full flex-1 flex-col rounded-xl p-4 transition-all duration-300 ease-in-out">
				<div className="py-52 sm:py-42">
					<HeroSection />
				</div>
			</main>
		</div>
	);
}
