"use client";
import type React from "react";

export function GetIcon(props: {
	type: "quizlet" | "flashcard" | "tiptap" | "google_docs" | "notion" | "youtube";
	className?: string;
}) {
	const iconProps = {
		width: "20",
		height: "20",
		className: props.className,
	};

	switch (props.type) {
		case "quizlet":
			return <QuizletIcon {...iconProps} />;
		case "tiptap":
			return <TextIcon {...iconProps} />;
		case "google_docs":
			return <GoogleDocsIcon {...iconProps} />;
		case "flashcard":
			return <FlashcardsIcon {...iconProps} />;
		case "notion":
			return <TextIcon {...iconProps} />;
		case "youtube":
			return <YouTubeIcon {...iconProps} />;
		default:
			return <DefaultIcon {...iconProps} />;
	}
}

function TextIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			focusable="false"
			height="24"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			viewBox="0 0 24 24"
			width="24"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d={"M17 6.1H3"} />
			<path d={"M21 12.1H3"} />
			<path d={"M15.1 18H3"} />
		</svg>
	);
}

function DefaultIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			focusable="false"
			height="24"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			viewBox="0 0 24 24"
			width="24"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
			<polyline points="14 2 14 8 20 8" />
		</svg>
	);
}

function QuizletIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			height="48"
			viewBox="0 0 48 48"
			width="48"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M6,10c0-2.209,1.791-4,4-4h28c2.209,0,4,1.791,4,4v28c0,2.209-1.791,4-4,4H10c-2.209,0-4-1.791-4-4 V10z"
				fill="#1565c0"
			/>
			<path
				d="M37,36l-3.664-4.478C34.999,29.462,36,26.847,36,24c0-6.617-5.383-12-12-12s-12,5.383-12,12 s5.383,12,12,12c2.095,0,4.065-0.543,5.781-1.49L31,36H37z M24,31c-3.86,0-7-3.141-7-7s3.14-7,7-7s7,3.141,7,7 c0,1.278-0.35,2.473-0.95,3.505L28,25h-6l4.519,5.523C25.736,30.827,24.889,31,24,31z"
				fill="#fff"
			/>
		</svg>
	);
}

function GoogleDocsIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			height="100"
			viewBox="0 0 100 100"
			width="100" // Base size
			xmlns="http://www.w3.org/2000/svg" // Base size
			{...props} // Spread props
		>
			<path
				d="M59.5,12H27c-2.761,0-5,2.239-5,5v66c0,2.761,2.239,5,5,5h46c2.761,0,5-2.239,5-5V30.5L59.5,12z"
				fill="#1565c0"
			/>
			<path
				d="M59.5,11.5V25c0,3.038,2.462,5.5,5.5,5.5h13.5L59.5,11.5z"
				fill="#9dc4e8"
			/>
			<rect fill="#fefdef" height="4" width="33" x="33.5" y="46.5" />
			<rect fill="#fefdef" height="4" width="33" x="33.5" y="54.5" />
			<rect fill="#fefdef" height="4" width="24" x="33.5" y="70.5" />
			<rect fill="#fefdef" height="4" width="33" x="33.5" y="62.5" />
			{/* Removed the <g> wrapper and paths with fill="#1f212b" for brevity, assume they exist */}
		</svg>
	);
}

const FlashcardsIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		fill="currentColor"
		height="24"
		viewBox="0 0 24 24"
		width="24" // Base size
		xmlns="http://www.w3.org/2000/svg" // Base size
		{...props} // Spread props
	>
		<rect fill="#e0e0e0" height="14" rx="2" ry="2" width="18" x="3" y="4" />
		<rect fill="white" height="10" rx="1" ry="1" width="14" x="5" y="6" />
		<path d="M6 8h6v1H6V8z" fill="#757575" />
		<path d="M6 10h8v1H6v-1z" fill="#757575" />
		<path d="M6 12h5v1H6v-1z" fill="#757575" />
		<rect fill="#cfcfcf" height="2" rx="1" ry="1" width="18" x="3" y="18" />
	</svg>
);

function YouTubeIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			preserveAspectRatio="xMidYMid"
			viewBox="0 0 256 180"
			{...props}
		>
			<path
				fill="#FF0000"
				d="M250.346 28.075A32.18 32.18 0 0 0 227.69 5.418C207.824 0 127.87 0 127.87 0S47.912.164 28.046 5.582A32.18 32.18 0 0 0 5.39 28.24c-6.009 35.298-8.34 89.084.165 122.97a32.18 32.18 0 0 0 22.656 22.657c19.866 5.418 99.822 5.418 99.822 5.418s79.955 0 99.82-5.418a32.18 32.18 0 0 0 22.657-22.657c6.338-35.348 8.291-89.1-.164-123.134Z"
			/>
			<path fill="#FFF" d="m102.421 128.06 66.328-38.418-66.328-38.418z" />
		</svg>
	);
}
