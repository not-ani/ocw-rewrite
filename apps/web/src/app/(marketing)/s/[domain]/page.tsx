import { api } from "@ocw/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { HeroSection } from "@/components/hero";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { getAbsoluteUrl } from "@/lib/og-utils";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ domain: string }>;
}): Promise<Metadata> {
	const { domain } = await params;
	const currentSubdomain = await extractSubdomain();

	const siteConfig = await fetchQuery(api.site.getSiteConfig, {
		school: domain,
	});

	const title = siteConfig
		? `${siteConfig.schoolName} OpenCourseWare`
		: "OpenCourseWare";
	const description = siteConfig
		? siteConfig.siteHero ||
			`${siteConfig.schoolName} OpenCourseWare is a platform for free, high-quality resources to students at ${siteConfig.schoolName}`
		: "Free, high-quality educational resources";

	// If accessed via subdomain, use /opengraph-image (which gets rewritten)
	// Otherwise, use the full path /s/[domain]/opengraph-image
	const ogImagePath =
		currentSubdomain === domain
			? "/opengraph-image"
			: `/s/${domain}/opengraph-image`;
	const urlPath = currentSubdomain === domain ? "/" : `/s/${domain}`;

	const ogImageUrl = await getAbsoluteUrl(ogImagePath);
	const url = await getAbsoluteUrl(urlPath);

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
		<div className="w-full bg-background/60">
			<main className="flex w-full flex-1 flex-col rounded-xl p-4 transition-all duration-300 ease-in-out">
				<div className="py-52 sm:py-42">
					<HeroSection />
				</div>
			</main>
		</div>
	);
}
