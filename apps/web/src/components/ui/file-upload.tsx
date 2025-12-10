"use client";

import { Upload, X, FileText, Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	uploadFile,
	type UploadFileOptions,
	type UploadFileResult,
	MAX_PDF_SIZE,
	MAX_IMAGE_SIZE,
} from "@/lib/upload";

type FileUploadProps = {
	courseId?: string;
	lessonId?: string;
	fileType?: "pdf" | "image";
	onUploadComplete?: (result: UploadFileResult) => void;
	onUploadError?: (error: Error) => void;
	onUploadBegin?: () => void;
	className?: string;
	content?: {
		label?: string;
		allowedContent?: string;
	};
	accept?: string;
	maxSize?: number; // in bytes
};

export function FileUploadDropzone({
	courseId,
	lessonId,
	fileType = "pdf",
	onUploadComplete,
	onUploadError,
	onUploadBegin,
	className,
	content,
	accept,
	maxSize,
}: FileUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [uploadedInfo, setUploadedInfo] = useState<{
		name: string;
		url?: string;
	} | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);

	const handleFile = useCallback(
		async (file: File) => {
			// Validate file size - use provided maxSize or default based on fileType
			const sizeLimit = maxSize ?? (fileType === "pdf" ? MAX_PDF_SIZE : MAX_IMAGE_SIZE);
			if (file.size > sizeLimit) {
				const maxSizeMB = Math.round(sizeLimit / (1024 * 1024));
				const error = new Error(`File size exceeds ${maxSizeMB}MB limit`);
				onUploadError?.(error);
				toast.error(error.message);
				return;
			}

			setIsUploading(true);
			onUploadBegin?.();

			try {
				const result: UploadFileResult = await uploadFile({
					file,
					courseId,
					lessonId,
					fileType,
				});

				setUploadedInfo({
					name: result.originalName,
					url: result.publicUrl,
				});
				onUploadComplete?.(result);
			} catch (error) {
				const err = error instanceof Error ? error : new Error("Upload failed");
				console.error(err);
				onUploadError?.(err);
				toast.error(`Upload failed: ${err.message}`);
			} finally {
				setIsUploading(false);
			}
		},
		[courseId, lessonId, fileType, onUploadComplete, onUploadError, onUploadBegin, maxSize],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			setIsDragging(false);

			const file = e.dataTransfer.files[0];
			if (file) {
				handleFile(file);
			}
		},
		[handleFile],
	);

	const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleFileInput = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				handleFile(file);
			}
		},
		[handleFile],
	);

	const clearUploadedInfo = useCallback(() => {
		setUploadedInfo(null);
		if (inputRef.current) {
			inputRef.current.value = "";
		}
	}, []);

	const defaultAccept = fileType === "pdf" ? "application/pdf" : "image/*";
	const defaultLabel =
		fileType === "pdf"
			? "Drop PDF here or click to browse"
			: "Drop image here or click to browse";
	const defaultAllowedContent =
		fileType === "pdf" ? "PDF up to 50MB" : "Image up to 10MB";

	if (uploadedInfo && !isUploading) {
		return (
			<div className={cn("rounded-lg border bg-muted/30 p-4", className)}>
				<div className="flex items-center gap-3">
					<FileText className="h-6 w-6 text-primary" />
					<div className="flex-1 min-w-0">
						<p className="truncate font-medium text-sm">{uploadedInfo.name}</p>
						{uploadedInfo.url ? (
							<a
								href={uploadedInfo.url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs text-muted-foreground hover:underline"
							>
								View file
							</a>
						) : null}
					</div>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => {
							clearUploadedInfo();
							inputRef.current?.click();
						}}
						className="h-8 w-8"
					>
						<Upload className="h-4 w-4" />
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div
			onDrop={handleDrop}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			className={cn(
				"relative cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors",
				isDragging && "border-primary bg-primary/5",
				isUploading && "border-primary bg-primary/5",
				className,
			)}
		>
			<input
				ref={inputRef}
				type="file"
				accept={accept || defaultAccept}
				onChange={handleFileInput}
				disabled={isUploading}
				className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
			/>
			<div className="flex flex-col items-center justify-center gap-2 text-center">
				{isUploading ? (
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				) : fileType === "pdf" ? (
					<FileText className="h-8 w-8 text-muted-foreground" />
				) : (
					<Upload className="h-8 w-8 text-muted-foreground" />
				)}
				<div className="space-y-1">
					<p className="text-sm font-medium">
						{content?.label || defaultLabel}
					</p>
					<p className="text-xs text-muted-foreground">
						{content?.allowedContent || defaultAllowedContent}
					</p>
				</div>
			</div>
		</div>
	);
}

export function FileUploadButton({
	courseId,
	lessonId,
	fileType = "image",
	onUploadComplete,
	onUploadError,
	onUploadBegin,
	className,
	accept,
	maxSize,
	children,
}: FileUploadProps & { children?: React.ReactNode }) {
	const [isUploading, setIsUploading] = useState(false);

	const handleFileInput = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			// Validate file size - use provided maxSize or default based on fileType
			const sizeLimit = maxSize ?? (fileType === "pdf" ? MAX_PDF_SIZE : MAX_IMAGE_SIZE);
			if (file.size > sizeLimit) {
				const maxSizeMB = Math.round(sizeLimit / (1024 * 1024));
				const error = new Error(`File size exceeds ${maxSizeMB}MB limit`);
				onUploadError?.(error);
				toast.error(error.message);
				return;
			}

			setIsUploading(true);
			onUploadBegin?.();

			try {
				const result = await uploadFile({
					file,
					courseId,
					lessonId,
					fileType,
				});

				onUploadComplete?.(result);
			} catch (error) {
				const err = error instanceof Error ? error : new Error("Upload failed");
				onUploadError?.(err);
				toast.error(`Upload failed: ${err.message}`);
			} finally {
				setIsUploading(false);
				// Reset input so same file can be selected again
				e.target.value = "";
			}
		},
		[courseId, lessonId, fileType, onUploadComplete, onUploadError, onUploadBegin, maxSize],
	);

	const defaultAccept = fileType === "pdf" ? "application/pdf" : "image/*";

	return (
		<div className="relative inline-block">
			<input
				type="file"
				accept={accept || defaultAccept}
				onChange={handleFileInput}
				disabled={isUploading}
				className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
			/>
			<Button
				type="button"
				disabled={isUploading}
				className={className}
				variant="outline"
			>
				{isUploading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Uploading...
					</>
				) : (
					children || "Upload File"
				)}
			</Button>
		</div>
	);
}
