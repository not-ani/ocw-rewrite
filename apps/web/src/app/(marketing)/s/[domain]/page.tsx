import type { Metadata } from "next";

import { HeroSection } from "@/components/hero";
import { getPublicSiteConfig } from "@/lib/public-data";
import { getTenantBaseUrl } from "@/lib/site";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ domain: string }>;
}): Promise<Metadata> {
	const { domain } = await params;
	const siteConfig = await getPublicSiteConfig(domain);

	const title = siteConfig
		? `${siteConfig.schoolName} OpenCourseWare`
		: "OpenCourseWare";
	const description = siteConfig
		? siteConfig.siteHero ||
			`${siteConfig.schoolName} OpenCourseWare is a platform for free, high-quality resources to students at ${siteConfig.schoolName}`
		: "Free, high-quality educational resources";

	const url = getTenantBaseUrl(domain);
	const ogImageUrl = `${url}/opengraph-image`;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			url,
			siteName: title,
			images: [
				{
					url: ogImageUrl,
					width: 1200,
					height: 630,
					alt: title,
				},
			],
			locale: "en_US",
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [ogImageUrl],
		},
		icons: {
			icon: [
				{
					rel: "icon",
					url: siteConfig?.siteLogo ?? "",
				},
			],
		},
	};
}

export default function Page() {
	return (
		<div className="bg-background/60 w-full">
			<main className="flex w-full flex-1 flex-col rounded-xl p-4 transition-all duration-300 ease-in-out">
				<div className="py-52 sm:py-42">
					<HeroSection />
				</div>
			</main>
		</div>
	);
}
