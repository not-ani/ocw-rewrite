"use client";

import { memo } from "react";
import { buttonVariants } from "../ui/button";

export const YouTubeEmbed = memo(function YouTubeEmbed({
	embedId,
}: {
	embedId: string | null;
}) {
	if (!embedId) {
		return (
			<div className="flex h-[60vh] items-center justify-center rounded-lg border">
				<p className="text-muted-foreground">Invalid YouTube Embed</p>
			</div>
		);
	}

	// Extract video ID from embed URL to create watch URL for "Open in new tab"
	const videoIdMatch = embedId.match(/embed\/([^?]+)/);
	const videoId = videoIdMatch?.[1];
	const watchUrl = videoId
		? `https://www.youtube.com/watch?v=${videoId}`
		: embedId;

	return (
		<div className="flex h-screen flex-col">
			<div className="flex flex-row items-center justify-between p-4">
				<h3 className="font-bold text-3xl">YouTube Video</h3>
				<a
					className={buttonVariants({
						variant: "default",
					})}
					href={watchUrl}
					rel="noopener noreferrer"
					target="_blank"
				>
					Open in new tab
				</a>
			</div>
			<div className="flex grow items-center justify-center bg-black/5">
				<div className="aspect-video w-full max-w-5xl">
					<iframe
						className="h-full w-full rounded-lg"
						src={embedId}
						title="YouTube video player"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						referrerPolicy="strict-origin-when-cross-origin"
						allowFullScreen
					/>
				</div>
			</div>
		</div>
	);
});

