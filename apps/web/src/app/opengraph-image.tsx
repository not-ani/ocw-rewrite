import { ImageResponse } from "next/og";

export const alt = "The OpenCourseWare Project";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
				}}
			>
				OCW
			</div>
			<div
				style={{
					position: "absolute",
					left: "66px",
					top: "359px",
					display: "flex",
					fontSize: "64px",
					color: "#C1C1C1",
					whiteSpace: "nowrap",
				}}
			>
				The OpenCourseWare Project
			</div>
			<div
				style={{
					position: "absolute",
					left: "66px",
					top: "456px",
					width: "603px",
					display: "flex",
					fontSize: "19px",
					color: "#C1C1C1",
				}}
			>
				The OpenCourseWare Project distributes free, high-quality resources to
				students around the world.
			</div>
		</div>,
		size,
	);
}
