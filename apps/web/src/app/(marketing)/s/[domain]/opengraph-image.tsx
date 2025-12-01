import { api } from "@ocw/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { ImageResponse } from "next/og";
import { extractSubdomain } from "@/lib/multi-tenant/server";

export const alt = "OpenCourseWare";
export const size = {
	width: 1200,
	height: 630,
};

export const contentType = "image/png";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Image() {
	try {
		const domain = await extractSubdomain();

		if (!domain) {
			return new ImageResponse(
				<div
					style={{
						height: "100%",
						width: "100%",
						display: "flex",
						flexDirection: "column",
						alignItems: "flex-start",
						justifyContent: "flex-start",
						backgroundColor: "#121112",
						backgroundImage:
							"radial-gradient(circle at 94% 84%, rgba(231, 138, 83, 0.2) 0%, #121112 100%)",
						position: "relative",
						fontFamily: '"Inter", sans-serif',
					}}
				>
					{/* Label */}
					<div
						style={{
							position: "absolute",
							left: "66px",
							top: "320px",
							display: "flex", // Added strictly for Satori compliance
							fontSize: "24px",
							color: "#E78A53",
							lineHeight: "29px",
							fontWeight: 400,
						}}
					>
						OCW
					</div>

					{/* Title */}
					<div
						style={{
							position: "absolute",
							left: "66px",
							top: "359px",
							display: "flex", // Added strictly for Satori compliance
							fontSize: "64px",
							color: "#C1C1C1",
							lineHeight: "77px",
							fontWeight: 400,
							whiteSpace: "nowrap",
						}}
					>
						The OpenCourseWare Project
					</div>

					{/* Description */}
					<div
						style={{
							position: "absolute",
							left: "66px",
							top: "456px",
							width: "603px",
							display: "flex", // Added strictly for Satori compliance
							fontSize: "19px",
							color: "#C1C1C1",
							lineHeight: "23px",
							fontWeight: 400,
						}}
					>
						The OpenCourseWare Project is a platform for distributing free,
						high-quality resources to students all around the world.
					</div>
				</div>,
				{ ...size },
			);
		}

		const siteConfig = await fetchQuery(api.site.getSiteConfig, {
			school: domain,
		});

		const schoolName = siteConfig?.schoolName || "OpenCourseWare";
		const titleText = `${schoolName} OCW`;
		const siteHero = `Welcome to the website for ${schoolName} OpenCourseWare. Find high quality tailored resources for ${schoolName}`;

		return new ImageResponse(
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "flex-start",
					justifyContent: "flex-start",
					backgroundColor: "#121112",
					backgroundImage:
						"radial-gradient(circle at 94% 84%, rgba(231, 138, 83, 0.2) 0%, #121112 100%)",
					position: "relative",
					fontFamily: '"Inter", sans-serif',
				}}
			>
				{/* Label */}
				<div
					style={{
						position: "absolute",
						left: "66px",
						top: "320px",
						display: "flex", // Added strictly for Satori compliance
						fontSize: "24px",
						color: "#E78A53",
						lineHeight: "29px",
						fontWeight: 400,
					}}
				>
					The OpenCourseWare Project
				</div>

				{/* Title */}
				<div
					style={{
						position: "absolute",
						left: "66px",
						top: "359px",
						display: "flex", // Added strictly for Satori compliance
						fontSize: "64px",
						color: "#C1C1C1",
						lineHeight: "77px",
						fontWeight: 400,
						whiteSpace: "nowrap",
					}}
				>
					{titleText}
				</div>

				{/* Description */}
				<div
					style={{
						position: "absolute",
						left: "66px",
						top: "456px",
						width: "603px",
						display: "flex", // Added strictly for Satori compliance
						fontSize: "19px",
						color: "#C1C1C1",
						lineHeight: "23px",
						fontWeight: 400,
					}}
				>
					{siteHero}
				</div>
			</div>,
			{
				...size,
			},
		);
	} catch (error) {
		console.error("Error generating opengraph image:", error);
		return new ImageResponse(
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "#121112",
				}}
			>
				<div
					style={{
						fontSize: "48px",
						color: "#C1C1C1",
						display: "flex",
					}}
				>
					OpenCourseWare
				</div>
			</div>,
			{
				...size,
			},
		);
	}
}
