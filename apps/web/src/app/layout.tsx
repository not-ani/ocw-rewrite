import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

import "../index.css";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import Providers from "@/components/providers";
import { PostHogIdentify } from "@/components/providers/posthog";
import { BrowserSiteContextProvider } from "@/lib/multi-tenant/context";
import { protocol, rootDomain } from "@/lib/site";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL(`${protocol}://${rootDomain}`),
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

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ClerkProvider>
					<Providers>
						<div className="bg-background grid h-screen grid-rows-[auto_1fr]">
							<NuqsAdapter>
								<BrowserSiteContextProvider>
									{children}
									<PostHogIdentify />
								</BrowserSiteContextProvider>
							</NuqsAdapter>
						</div>
					</Providers>
				</ClerkProvider>
			</body>
		</html>
	);
}
