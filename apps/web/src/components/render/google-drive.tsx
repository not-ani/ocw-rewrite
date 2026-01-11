"use client";

import { memo } from "react";
import { Embed } from "../iframe";
import { buttonVariants } from "@ocw/ui/button";

export const GoogleDriveEmbed = memo(function GoogleDriveEmbed({
	embedId,
	password,
}: {
	embedId: string | null;
	password: string | null;
}) {
	if (!embedId) {
		return (
			<div className="flex h-[60vh] items-center justify-center rounded-lg border">
				<p className="text-muted-foreground">Invalid Google Drive Embed</p>
			</div>
		);
	}

	const url = embedId;

	return (
		<div className="flex h-screen flex-col">
			<div className="flex flex-row items-center justify-between p-4">
				<h3 className="font-bold text-3xl">Google Drive (PDF)</h3>
				<a
					className={buttonVariants({
						variant: "default",
					})}
					href={embedId}
					rel="noopener noreferrer"
					target="_blank"
				>
					Open in new tab
				</a>
				{password ? (
					<p className="ml-4 text-gray-600">Password: {password}</p>
				) : null}
			</div>
			<div className="grow">
				<Embed className="h-full w-full border-0" src={url} />
			</div>
		</div>
	);
});
