import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import { ImageResponse } from "next/og";
import { isValidConvexId } from "@/lib/convex-utils";
import { extractSubdomain } from "@/lib/multi-tenant/server";

export const alt = "OpenCourseWare";
export const size = {
	width: 1200,
	height: 630,
};

export const contentType = "image/png";
export const runtime = "nodejs";
// Cache OG images for 1 hour, revalidate in background
export const revalidate = 3600;

export default async function Image({
	params,
}: {
	params: Promise<{ id: string; unitId: string }>;
}) {
	try {
		const { unitId } = await params;
		const domain = await extractSubdomain();

		if (!domain) {
			return new ImageResponse(
				<div>
					<h1>No domain found</h1>
				</div>,
				{ ...size },
			);
		}

		if (!isValidConvexId(unitId)) {
			return new ImageResponse(
				<div>
					<h1>Invalid unit ID</h1>
				</div>,
				{ ...size },
			);
		}

		const [siteConfig, unit] = await Promise.all([
			fetchQuery(api.site.getSiteConfig, {
				school: domain,
			}),
			fetchQuery(api.units.getById, {
				id: unitId as Id<"units">,
				school: domain,
			}),
		]);

		if (!unit) {
			return new ImageResponse(
				<div>
					<h1>Unit not found</h1>
				</div>,
				{ ...size },
			);
		}

		const course = await fetchQuery(api.courses.getCourseById, {
			courseId: unit.courseId,
			school: domain,
		});

		const schoolName = siteConfig?.schoolName || "OpenCourseWare";
		const courseName = course?.name || "";
		const titleText = unit.name || "";

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
					{schoolName} OCW | {courseName}
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
					Study the {unit.name} in {courseName}
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
