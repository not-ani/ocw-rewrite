import { ImageResponse } from "next/og";

import { isValidConvexId } from "@/lib/convex-utils";
import {
	getPublicCourse,
	getPublicSiteConfig,
	getPublicUnit,
} from "@/lib/public-data";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";

export const alt = "OpenCourseWare";
export const size = {
	width: 1200,
	height: 630,
};

export const contentType = "image/png";

export async function renderUnitOpenGraphImage(
	domain: string | null,
	unitId: string,
) {
	try {
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
			getPublicSiteConfig(domain),
			getPublicUnit(domain, unitId as Id<"units">),
		]);

		if (!unit) {
			return new ImageResponse(
				<div>
					<h1>Unit not found</h1>
				</div>,
				{ ...size },
			);
		}

		const course = await getPublicCourse(domain, unit.courseId);

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

export default async function Image({
	params,
}: {
	params: Promise<{ id: string; unitId: string }>;
}) {
	return renderUnitOpenGraphImage(null, (await params).unitId);
}
