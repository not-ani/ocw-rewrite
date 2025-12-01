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
export const dynamic = "force-dynamic";

type Params = {
	id: string;
	unitId: string;
	lessonId: string;
};

export default async function Image({ params }: { params: Promise<Params> }) {
	try {
		const { unitId, lessonId } = await params;
		const domain = await extractSubdomain();

		if (!domain) {
			return new ImageResponse(
				<div
					style={{
						height: "100%",
						width: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: "#121112",
						fontFamily: '"Inter", sans-serif',
					}}
				>
					<h1
						style={{
							margin: 0,
							fontSize: "32px",
							color: "#C1C1C1",
						}}
					>
						No domain found
					</h1>
				</div>,
				{ ...size },
			);
		}

		if (!isValidConvexId(unitId) || !isValidConvexId(lessonId)) {
			return new ImageResponse(
				<div
					style={{
						height: "100%",
						width: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: "#121112",
						fontFamily: '"Inter", sans-serif',
					}}
				>
					<h1
						style={{
							margin: 0,
							fontSize: "32px",
							color: "#C1C1C1",
						}}
					>
						Invalid unit or lesson ID
					</h1>
				</div>,
				{ ...size },
			);
		}

		const [siteConfig, lessonData, unit] = await Promise.all([
			fetchQuery(api.site.getSiteConfig, { school: domain }),
			fetchQuery(api.lesson.getLessonById, {
				id: lessonId as Id<"lessons">,
				school: domain,
			}),
			fetchQuery(api.units.getById, {
				id: unitId as Id<"units">,
				school: domain,
			}),
		]);

		if (!lessonData || !unit) {
			return new ImageResponse(
				<div
					style={{
						height: "100%",
						width: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: "#121112",
						fontFamily: '"Inter", sans-serif',
					}}
				>
					<h1
						style={{
							margin: 0,
							fontSize: "32px",
							color: "#C1C1C1",
						}}
					>
						Lesson or unit not found
					</h1>
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
		const unitName = unit.name || "";
		const titleText = lessonData.lesson.name || "";

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
				<div
					style={{
						position: "absolute",
						left: "66px",
						top: "320px",
						display: "flex",
						fontSize: "24px",
						color: "#E78A53",
						lineHeight: "29px",
						fontWeight: 400,
					}}
				>
					{schoolName} OCW | {courseName} | {unitName}
				</div>

				<div
					style={{
						position: "absolute",
						left: "66px",
						top: "359px",
						display: "flex",
						fontSize: "64px",
						color: "#C1C1C1",
						lineHeight: "77px",
						fontWeight: 400,
						whiteSpace: "nowrap",
					}}
				>
					{titleText}
				</div>
			</div>,
			{ ...size },
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
					fontFamily: '"Inter", sans-serif',
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
			{ ...size },
		);
	}
}
