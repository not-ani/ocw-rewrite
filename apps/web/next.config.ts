import type { NextConfig } from "next";

const configuredRootHost = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost")
	.split(":")[0]
	?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const tenantHosts = [
	// Production/custom domains, excluding canonical www and Clerk's custom host.
	`(?<domain>(?!(?:www|clerk)\\.)[^.]+)\\.${configuredRootHost}(?::\\d+)?`,
	// Local tenant URLs such as mit.localhost:3001.
	"(?<domain>(?!(?:www|clerk)\\.)[^.]+)\\.localhost(?::\\d+)?",
	// Vercel branch/tenant preview convention used by the existing proxy.
	"(?<domain>(?!(?:www|clerk)---)[^.]+)---.+\\.vercel\\.app",
];

const nextConfig: NextConfig = {
	typedRoutes: true,
	async rewrites() {
		return {
			// Host routing must run before the root filesystem route is selected.
			// Only tenant landing/metadata routes are rewritten: assets, APIs,
			// analytics and private route families keep normal routing semantics.
			beforeFiles: tenantHosts.flatMap((host) => [
				{
					source: "/",
					has: [{ type: "host" as const, value: host }],
					destination: "/s/:domain",
				},
				{
					source: "/robots.txt",
					has: [{ type: "host" as const, value: host }],
					destination: "/s/:domain/robots.txt",
				},
				{
					source: "/sitemap.xml",
					has: [{ type: "host" as const, value: host }],
					destination: "/s/:domain/sitemap.xml",
				},
				{
					source: "/opengraph-image",
					has: [{ type: "host" as const, value: host }],
					destination: "/tenant-og/:domain",
				},
				...[
					"about",
					"contact",
					"contribute",
					"contributors",
					"courses",
					"teachers",
				].map((path) => ({
					source: `/${path}`,
					has: [{ type: "host" as const, value: host }],
					destination: `/s/:domain/${path}`,
				})),
				{
					source: "/course/:id",
					has: [{ type: "host" as const, value: host }],
					destination: "/t/:domain/course/:id",
				},
				{
					source: "/course/:id/opengraph-image",
					has: [{ type: "host" as const, value: host }],
					destination: "/t/:domain/course/:id/opengraph-image",
				},
				{
					source: "/course/:id/:unitId((?!dashboard)[^/]+)",
					has: [{ type: "host" as const, value: host }],
					destination: "/t/:domain/course/:id/:unitId",
				},
				{
					source: "/course/:id/:unitId((?!dashboard)[^/]+)/opengraph-image",
					has: [{ type: "host" as const, value: host }],
					destination: "/t/:domain/course/:id/:unitId/opengraph-image",
				},
				{
					source: "/course/:id/:unitId((?!dashboard)[^/]+)/:lessonId",
					has: [{ type: "host" as const, value: host }],
					destination: "/t/:domain/course/:id/:unitId/:lessonId",
				},
				{
					source:
						"/course/:id/:unitId((?!dashboard)[^/]+)/:lessonId/opengraph-image",
					has: [{ type: "host" as const, value: host }],
					destination:
						"/t/:domain/course/:id/:unitId/:lessonId/opengraph-image",
				},
			]),
			afterFiles: [
				{
					source: "/ocw-path-for-real/static/:path*",
					destination: "https://us-assets.i.posthog.com/static/:path*",
				},
				{
					source: "/ocw-path-for-real/:path*",
					destination: "https://us.i.posthog.com/:path*",
				},
			],
			fallback: [],
		};
	},
	async redirects() {
		return tenantHosts.map((host) => ({
			source: "/ocw-admin/:path*",
			has: [{ type: "host" as const, value: host }],
			destination: "/",
			permanent: false,
		}));
	},
	// This is required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "ugakd4mkxv.ufs.sh",
			},
			{
				protocol: "https",
				hostname: "utfs.io",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "moltmqa28u.ufs.sh",
			},
		],
	},
	reactCompiler: true,
	transpilePackages: ["@ocw/ui", "@ocw/redis", "@ocw/parse", "@ocw/validators"],
	experimental: {
		optimizePackageImports: [
			"lucide-react",
			"recharts",
			"@radix-ui/react-accordion",
			"@radix-ui/react-alert-dialog",
			"@radix-ui/react-avatar",
			"@radix-ui/react-checkbox",
			"@radix-ui/react-collapsible",
			"@radix-ui/react-dialog",
			"@radix-ui/react-dropdown-menu",
			"@radix-ui/react-label",
			"@radix-ui/react-navigation-menu",
			"@radix-ui/react-popover",
			"@radix-ui/react-scroll-area",
			"@radix-ui/react-select",
			"@radix-ui/react-separator",
			"@radix-ui/react-slot",
			"@radix-ui/react-switch",
			"@radix-ui/react-tabs",
			"@radix-ui/react-tooltip",
			"@dnd-kit/core",
			"@dnd-kit/sortable",
			"@dnd-kit/utilities",
			"motion",
		],
	},
};

export default nextConfig;
