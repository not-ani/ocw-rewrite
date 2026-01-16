"use client";

import { memo } from "react";
import { buttonVariants } from "@ocw/ui/button";

export const OtherEmbed = memo(function OtherEmbed({
	url,
	title = "External Content",
}: {
	url: string | null;
	title?: string;
}) {
	if (!url) {
		return (
			<div className="flex h-[60vh] items-center justify-center rounded-lg border">
				<p className="text-muted-foreground">Invalid External Embed</p>
			</div>
		);
	}

	return (
		<div className="flex h-screen flex-col">
			<div className="flex flex-row items-center justify-between p-4">
				<h3 className="font-bold text-3xl">{title}</h3>
				<a
					className={buttonVariants({
						variant: "default",
					})}
					href={url}
					rel="noopener noreferrer"
					target="_blank"
				>
					Open in new tab
				</a>
			</div>
			<div className="flex grow items-center justify-center bg-black/5">
				<div className="h-full w-full">
					<iframe
						className="h-full w-full rounded-lg"
						src={url}
						title={title}
						referrerPolicy="strict-origin-when-cross-origin"
					/>
				</div>
			</div>
		</div>
	);
});
