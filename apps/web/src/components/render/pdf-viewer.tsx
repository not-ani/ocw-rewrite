"use client";

import { Download, ZoomIn, ZoomOut } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button, buttonVariants } from "@ocw/ui/button";

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
	const [scale, setScale] = useState(1.0);
	const [error, setError] = useState<string | null>(null);

	const onDocumentLoadSuccess = useCallback(
		({ numPages }: { numPages: number }) => {
			setNumPages(numPages);
		},
		[],
	);

	const onDocumentLoadError = useCallback((error: Error) => {
		console.error("Error loading PDF:", error);
		setError(error.message);
	}, []);

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
					<span className="ml-2 min-w-[5rem] text-center text-sm tabular-nums">
						{numPages ? `${numPages} pages` : "Loading..."}
					</span>
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
					{error ? (
						<div className="flex h-[60vh] items-center justify-center">
							<div className="text-center">
								<p className="font-medium text-destructive">
									Failed to load PDF
								</p>
								<p className="mt-2 text-muted-foreground text-sm">{error}</p>
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
							file={url}
							onLoadSuccess={onDocumentLoadSuccess}
							onLoadError={onDocumentLoadError}
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
							<div className="flex w-full max-w-5xl flex-col items-center gap-6">
								{numPages === null ? (
									<div className="flex h-[60vh] items-center justify-center">
										<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
									</div>
								) : (
									Array.from({ length: numPages }, (_, idx) => (
										<Page
											key={`page_${idx + 1}`}
											pageNumber={idx + 1}
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
									))
								)}
							</div>
						</Document>
					)}
				</div>
			</div>
		</div>
	);
});
