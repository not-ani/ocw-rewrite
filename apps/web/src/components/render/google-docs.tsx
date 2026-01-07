"use client";
import { memo, useCallback, useEffect, useState } from "react";
import { Streamdown } from "streamdown";

import { buttonVariants } from "@/components/ui/button";

export const GoogleDocsEmbed = memo(function GoogleDocsEmbed({
	embedId,
}: {
	embedId: string | null;
}) {
	const [markdown, setMarkdown] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const fetchMarkdown = useCallback(async () => {
		setLoading(true);
		try {
			const response = await fetch(
				`/api/get-md?url=${encodeURIComponent(embedId ?? "")}`,
				{ cache: "no-store" },
			);
			const data = await response.json();

			if (data.error) {
				console.error("API Error:", data.error);
				return;
			}

			setMarkdown(data.markdown);
		} catch (error) {
			console.error("Error fetching markdown:", error);
		} finally {
			setLoading(false);
		}
	}, [embedId]); // embedId is the actual dependency

	useEffect(() => {
		fetchMarkdown();
	}, [fetchMarkdown]);

	if (!embedId) {
		return (
			<div className="flex h-[60vh] items-center justify-center rounded-lg border">
				<p className="text-muted-foreground">Invalid Google Docs Embed</p>
			</div>
		);
	}

	return (
		<div className="flex h-screen max-h-[90vh] flex-col">
			<div className="flex flex-row items-center justify-between p-4">
				<div />
				<div className="flex gap-2">
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
				</div>
			</div>

			<div className="max-w-screen overflow-y-auto border-t p-4">
				{loading ? (
					<div className="flex h-32 items-center justify-center">
						<p className="text-muted-foreground">Loading...</p>
					</div>
				) : markdown ? (
					<div className="prose prose-sm max-w-full bg-background">
						<Streamdown>{markdown}</Streamdown>
					</div>
				) : (
					<div className="flex h-32 items-center justify-center">
						<p className="text-muted-foreground">Failed to load markdown</p>
					</div>
				)}
			</div>
		</div>
	);
});
