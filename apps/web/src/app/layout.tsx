import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "../index.css";
import { ClerkProvider } from "@clerk/nextjs";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import Providers from "@/components/providers";
import { PostHogIdentify } from "@/components/providers/posthog";
import { SiteContextProvider } from "@/lib/multi-tenant/context";
import { extractSubdomain } from "@/lib/multi-tenant/server";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
	const subdomain = await extractSubdomain();

	if (
		!subdomain ||
		subdomain === "www" ||
		subdomain === "localhost:3001" ||
		subdomain === "ocwproject.org"
	) {
		return {
			title: "The OpenCourseWare Project",
			description:
				"The OpenCourseWare Project is a platform for free, high-quality resources for free",
			icons: {
				icon: [
					{
						rel: "icon",
						media: "(prefers-color-scheme: dark)",
						url: "/rael-logo.svg",
					},
				],
			},
		};
	}
	const siteConfig = await fetchQuery(api.site.getSiteConfig, {
		school: subdomain,
	});
	return {
		title: `${siteConfig?.schoolName} OpenCourseWare`,
		description: `${siteConfig?.schoolName} OpenCourseWare is a platform for free, high-quality resources to students at ${siteConfig?.schoolName}`,
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

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const subdomain = await extractSubdomain();

	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ClerkProvider>
					<Providers>
						<div className="grid h-screen grid-rows-[auto_1fr] bg-background">
							<NuqsAdapter>
								<SiteContextProvider subdomain={subdomain}>
									{children}
									<PostHogIdentify />
								</SiteContextProvider>
							</NuqsAdapter>
						</div>
					</Providers>
				</ClerkProvider>
			</body>
		</html>
	);
}
