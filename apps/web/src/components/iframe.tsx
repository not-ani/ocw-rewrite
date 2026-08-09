"use client";
import { LoaderCircleIcon } from "lucide-react";
import type React from "react";
import { useEffect, useEffectEvent, useRef, useState } from "react";

interface EmbedLoaderProps {
	src: string;
	loaderComponent?: React.ReactNode;
	timeout?: number;
	onLoad?: () => void;
	onError?: (error: Error) => void;
	className?: string;
}

const DEFAULT_TIMEOUT = 10_000; // 10 seconds
/*
 * TODO: we have  error managment but if any errors are present it stops the embed from rendering entirely and displays the error message.
 * we need to find a way to only stop the embed when there are breaking errors and not just when there are errors.
 */

export function Embed({
	src: embedUrl,
	loaderComponent,
	timeout = DEFAULT_TIMEOUT,
	onLoad,
	onError,
	className,
}: EmbedLoaderProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const reportError = useEffectEvent((error: Error) => {
		onError?.(error);
	});

	useEffect(() => {
		// Set a timeout to trigger error if embed takes too long to load.
		timeoutRef.current = setTimeout(() => {
			if (isLoading) {
				setHasError(true);
				setIsLoading(false);
				reportError(new Error("Embed load timed out"));
			}
		}, timeout);

		return () => {
			clearTimeout(timeoutRef.current);
		};
	}, [timeout, isLoading]);

	const handleLoad = () => {
		clearTimeout(timeoutRef.current);
		setIsLoading(false);
		onLoad?.();
	};

	const handleError = () => {
		clearTimeout(timeoutRef.current);
		setHasError(true);
		setIsLoading(false);
		onError?.(new Error("Failed to load embed"));
	};

	return (
		<div className={className}>
			{isLoading && !hasError ? (
				<output aria-live="polite" className="loader">
					{loaderComponent ?? (
						<div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-muted/20">
							<LoaderCircleIcon className="mb-4 h-8 w-8 animate-spin text-primary" />
							<div className="text-center">
								<p className="font-medium">Loading content...</p>
								<ul className="mt-2 text-muted-foreground text-sm">
									<li>If this takes a long time, try turning off your VPN</li>
									<li>Or click the &quot;Open in new tab&quot; button</li>
								</ul>
							</div>
						</div>
					)}
				</output>
			) : null}

			<iframe
				loading="eager"
				onError={handleError}
				onLoad={handleLoad}
				ref={iframeRef}
				src={embedUrl}
				style={{
					display: isLoading ? "none" : "block",
					width: "100%",
					height: "100%",
				}}
				title="Embedded Content"
				// Add security and performance attributes
				sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
				referrerPolicy="no-referrer-when-downgrade"
			/>
		</div>
	);
}
