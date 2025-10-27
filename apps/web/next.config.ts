import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	typescript: {
		ignoreBuildErrors: true,
	},
	async rewrites() {
		return [
			{
				source: "/ocw-path-for-real/static/:path*",
				destination: "https://us-assets.i.posthog.com/static/:path*",
			},
			{
				source: "/ocw-path-for-real/:path*",
				destination: "https://us.i.posthog.com/:path*",
			},
		];
	},
	// This is required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true,
	images: {
		domains: ["ugakd4mkxv.ufs.sh", "utfs.io"],
	},
	reactCompiler: true,
};

export default nextConfig;
