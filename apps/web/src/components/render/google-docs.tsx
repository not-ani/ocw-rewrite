"use client";
import { useEffect, useState } from "react";
import { Streamdown } from "streamdown";

import { buttonVariants } from "@ocw/ui/button";

async function getMarkdown(embedId: string, signal: AbortSignal) {
	const response = await fetch(
		`/api/get-md?url=${encodeURIComponent(embedId)}`,
		{
			signal,
		},
	);
	if (!response.ok) {
		throw new Error(`Markdown request failed with status ${response.status}`);
	}

	const data: unknown = await response.json();
	if (typeof data !== "object" || data === null) {
		throw new Error("Markdown API returned an invalid response");
	}
	if ("error" in data && typeof data.error === "string") {
		throw new Error(data.error);
	}
	if (!("markdown" in data) || typeof data.markdown !== "string") {
		throw new Error("Markdown API response did not include markdown");
	}

	return data.markdown;
}

export function GoogleDocsEmbed({ embedId }: { embedId: string | null }) {
	const [result, setResult] = useState<{
		embedId: string | null;
		markdown: string | null;
	}>({ embedId: null, markdown: null });
	const loading = embedId !== null && result.embedId !== embedId;
	const markdown = result.embedId === embedId ? result.markdown : null;

	useEffect(() => {
		if (!embedId) return;

		const controller = new AbortController();
		void getMarkdown(embedId, controller.signal)
			.then((markdownResult) =>
				setResult({ embedId, markdown: markdownResult }),
			)
			.catch((error: unknown) => {
				if (!controller.signal.aborted) {
					console.error("Error fetching markdown:", error);
					setResult({ embedId, markdown: null });
				}
			});

		return () => controller.abort();
	}, [embedId]);

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
					<div className="prose prose-sm bg-background max-w-full">
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
}
