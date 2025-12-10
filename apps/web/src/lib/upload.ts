"use client";

// File size limits in bytes (matching server-side limits)
export const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export type UploadFileOptions = {
	file: File;
	courseId?: string;
	lessonId?: string;
	fileType?: "pdf" | "image";
	onProgress?: (progress: number) => void;
};

export type UploadFileResult = {
	url: string;
	publicUrl: string;
	filePath: string;
	originalName: string;
};

/**
 * Upload a file to Railway S3-compatible storage
 * @param options Upload options
 * @returns Upload result with public URL
 */
export async function uploadFile(
	options: UploadFileOptions,
): Promise<UploadFileResult> {
	const { file, courseId, lessonId, fileType = "pdf" } = options;

	// Validate file size before making the request
	const maxSize = fileType === "pdf" ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;
	if (file.size > maxSize) {
		const maxSizeMB = Math.round(maxSize / (1024 * 1024));
		throw new Error(`File size exceeds maximum allowed size of ${maxSizeMB}MB`);
	}

	// Determine content type from file
	const contentType = file.type || getContentTypeFromFile(file, fileType);

	// Build query parameters
	const params = new URLSearchParams({
		contentType,
		fileType,
		fileSize: file.size.toString(), // Send file size for server-side validation
	});
	if (courseId) params.append("courseId", courseId);
	if (lessonId) params.append("lessonId", lessonId);
	if (fileType === "pdf" && file.name) {
		params.append("fileName", file.name);
	}

	// Get presigned URL from our API
	const response = await fetch(`/api/upload-file?${params.toString()}`);

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: "Upload failed" }));
		throw new Error(error.error || `Upload failed: ${response.statusText}`);
	}

	const { uploadUrl, publicUrl, filePath } = await response.json();

	// Upload file to S3 using presigned URL
	const uploadResponse = await fetch(uploadUrl, {
		method: "PUT",
		body: file,
		headers: {
			"Content-Type": contentType,
		},
	});

	if (!uploadResponse.ok) {
		throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
	}

	return {
		url: publicUrl,
		publicUrl,
		filePath,
		originalName: file.name,
	};
}

/**
 * Get content type from file extension or default based on file type
 */
function getContentTypeFromFile(file: File, fileType: "pdf" | "image"): string {
	if (file.type) {
		return file.type;
	}

	const extension = file.name.split(".").pop()?.toLowerCase();

	if (fileType === "pdf") {
		return "application/pdf";
	}

	// Image types
	switch (extension) {
		case "png":
			return "image/png";
		case "jpg":
		case "jpeg":
			return "image/jpeg";
		case "gif":
			return "image/gif";
		case "webp":
			return "image/webp";
		case "svg":
			return "image/svg+xml";
		default:
			return "image/png";
	}
}
