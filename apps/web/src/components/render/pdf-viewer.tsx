"use client";

import {
	ChevronLeft,
	ChevronRight,
	Download,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button, buttonVariants } from "../ui/button";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker using CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// PDF.js options - use CDN for cMaps and standard fonts
const options = {
	cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
	standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
};

interface PdfViewerProps {
	url: string | null;
	title?: string;
}

export const PdfViewer = memo(function PdfViewer({
	url,
	title,
}: PdfViewerProps) {
	const [numPages, setNumPages] = useState<number | null>(null);
	const [pageNumber, setPageNumber] = useState(1);
	const [scale, setScale] = useState(1.0);
	const [error, setError] = useState<string | null>(null);
	const [errorDetail, setErrorDetail] = useState<string | null>(null);
	const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
	const [isResolvingUrl, setIsResolvingUrl] = useState(false);

	useEffect(() => {
		// reset errors when the source URL changes
		setError(null);
		setErrorDetail(null);
		setNumPages(null);
		setPageNumber(1);
		setResolvedUrl(null);
	}, [url]);

	const deriveErrorMessage = useMemo(
		() => (incoming: Error) => {
			const message = incoming.message || "Unknown error";
			const normalized = message.toLowerCase();

			if (
				message.includes("Unexpected server response (403)") ||
				normalized.includes("403") ||
				normalized.includes("access denied") ||
				normalized.includes("forbidden")
			) {
				return "Access denied when loading this PDF. The link may have expired or isn't publicly accessible. Try the direct link below or ask an admin to re-upload.";
			}

			if (
				message.includes("Unexpected server response (404)") ||
				normalized.includes("404")
			) {
				return "We couldn't find this PDF (404). If it was recently uploaded, please re-upload to refresh the link.";
			}

			if (normalized.includes("failed to fetch")) {
				return "Unable to fetch this PDF. It may require a signed URL or public access.";
			}

			return `Failed to load PDF: ${message}`;
		},
		[],
	);

	const onDocumentLoadSuccess = useCallback(
		({ numPages }: { numPages: number }) => {
			setNumPages(numPages);
		},
		[],
	);

	const onDocumentLoadError = useCallback(
		(error: Error) => {
			console.error("Error loading PDF:", error);
			setError(deriveErrorMessage(error));
			setErrorDetail(error.message);
		},
		[deriveErrorMessage],
	);

	const onSourceError = useCallback(
		(error: Error) => {
			console.error("Source error loading PDF:", error);
			setError(deriveErrorMessage(error));
			setErrorDetail(error.message);
		},
		[deriveErrorMessage],
	);

	useEffect(() => {
		let cancelled = false;

		async function resolveUrl() {
			if (!url) {
				setResolvedUrl(null);
				return;
			}

			setIsResolvingUrl(true);

			try {
				const response = await fetch(
					`/api/file-url?fileUrl=${encodeURIComponent(url)}`,
				);

				if (!response.ok) {
					const payload = await response
						.json()
						.catch(() => ({ error: "Failed to generate access URL" }));
					throw new Error(payload.error || response.statusText);
				}

				const data = await response.json();
				if (!cancelled) {
					setResolvedUrl(data.signedUrl ?? url);
				}
			} catch (err) {
				if (!cancelled) {
					const errorObj = err instanceof Error ? err : new Error("Unknown error");
					setError(deriveErrorMessage(errorObj));
					setErrorDetail(errorObj.message);
					// Fallback to original URL in case it is somehow accessible
					setResolvedUrl(url);
				}
			} finally {
				if (!cancelled) {
					setIsResolvingUrl(false);
				}
			}
		}

		void resolveUrl();

		return () => {
			cancelled = true;
		};
	}, [url, deriveErrorMessage]);

	const goToPrevPage = useCallback(() => {
		setPageNumber((prev) => Math.max(prev - 1, 1));
	}, []);

	const goToNextPage = useCallback(() => {
		setPageNumber((prev) => Math.min(prev + 1, numPages ?? prev));
	}, [numPages]);

	const zoomIn = useCallback(() => {
		setScale((prev) => Math.min(prev + 0.25, 3));
	}, []);

	const zoomOut = useCallback(() => {
		setScale((prev) => Math.max(prev - 0.25, 0.5));
	}, []);

	if (!url) {
		return (
			<div className="flex h-[60vh] items-center justify-center rounded-lg border">
				<p className="text-muted-foreground">No PDF file provided</p>
			</div>
		);
	}

	return (
		<div className="flex h-screen flex-col">
			{/* Header */}
			<div className="flex flex-row flex-wrap items-center justify-between gap-4 border-b p-4">
				<h3 className="font-bold text-2xl">{title ?? "PDF Viewer"}</h3>

				<div className="flex items-center gap-2">
					{/* Zoom controls */}
					<Button
						variant="outline"
						size="icon"
						onClick={zoomOut}
						disabled={scale <= 0.5}
						aria-label="Zoom out"
					>
						<ZoomOut className="h-4 w-4" />
					</Button>
					<span className="min-w-[4rem] text-center text-sm tabular-nums">
						{Math.round(scale * 100)}%
					</span>
					<Button
						variant="outline"
						size="icon"
						onClick={zoomIn}
						disabled={scale >= 3}
						aria-label="Zoom in"
					>
						<ZoomIn className="h-4 w-4" />
					</Button>

					{/* Page navigation */}
					<div className="ml-4 flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							onClick={goToPrevPage}
							disabled={pageNumber <= 1}
							aria-label="Previous page"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="min-w-[5rem] text-center text-sm tabular-nums">
							{numPages ? `${pageNumber} / ${numPages}` : "Loading..."}
						</span>
						<Button
							variant="outline"
							size="icon"
							onClick={goToNextPage}
							disabled={pageNumber >= (numPages ?? 1)}
							aria-label="Next page"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>

				<a
					className={buttonVariants({
						variant: "default",
					})}
					href={url}
					rel="noopener noreferrer"
					target="_blank"
					download
				>
					<Download className="mr-2 h-4 w-4" />
					Download PDF
				</a>
			</div>

			{/* PDF Content */}
			<div className="flex-1 overflow-auto bg-muted/30">
				<div className="flex min-h-full items-start justify-center p-4">
					{isResolvingUrl ? (
						<div className="flex h-[60vh] items-center justify-center">
							<div className="text-center">
								<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
								<p className="text-muted-foreground">Requesting access to PDF...</p>
							</div>
						</div>
					) : error ? (
						<div className="flex h-[60vh] items-center justify-center">
							<div className="text-center">
								<p className="font-medium text-destructive">{error}</p>
								{errorDetail && errorDetail !== error ? (
									<p className="mt-2 text-muted-foreground text-xs">
										Details: {errorDetail}
									</p>
								) : null}
								<a
									className={buttonVariants({
										variant: "outline",
										className: "mt-4",
									})}
									href={url}
									rel="noopener noreferrer"
									target="_blank"
								>
									Try opening directly
								</a>
							</div>
						</div>
					) : (
						<Document
							file={resolvedUrl ?? url}
							onLoadSuccess={onDocumentLoadSuccess}
							onLoadError={onDocumentLoadError}
							onSourceError={onSourceError}
							options={options}
							loading={
								<div className="flex h-[60vh] items-center justify-center">
									<div className="text-center">
										<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
										<p className="text-muted-foreground">Loading PDF...</p>
									</div>
								</div>
							}
							className="flex justify-center"
						>
							<Page
								pageNumber={pageNumber}
								scale={scale}
								renderTextLayer
								renderAnnotationLayer
								loading={
									<div className="flex h-[60vh] items-center justify-center">
										<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
									</div>
								}
								className="shadow-lg"
							/>
						</Document>
					)}
				</div>
			</div>
		</div>
	);
});
