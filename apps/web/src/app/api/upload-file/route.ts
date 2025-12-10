import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import z4 from "zod/v4";
import { env } from "@/env";
import { getAuthToken } from "@/lib/auth";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { checkAdminOrEditorPermission } from "@/lib/permissions";
import { api } from "@ocw/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";

// Normalize endpoint to include protocol and force path-style for S3-compatible buckets
const normalizedEndpoint = env.RAILWAY_ENDPOINT.startsWith("http")
	? env.RAILWAY_ENDPOINT
	: `https://${env.RAILWAY_ENDPOINT}`;

const s3 = new S3Client({
	region: "auto",
	endpoint: normalizedEndpoint,
	forcePathStyle: true,
	credentials: {
		accessKeyId: env.RAILWAY_ACCESS_KEY,
		secretAccessKey: env.RAILWAY_SECRET_KEY,
	},
});

// File size limits in bytes
const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB - reasonable for textbooks
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB - reasonable for logos/images

const validator = z4.object({
	lessonId: z4.string().optional(),
	courseId: z4.string().optional(),
	contentType: z4.string().default("application/pdf"),
	fileType: z4.enum(["pdf", "image"]).default("pdf"),
	fileName: z4.string().optional(),
	fileSize: z4.number().optional(), // Expected file size in bytes for validation
});

/**
 * Check if user is site admin
 */
async function checkSiteAdmin(subdomain: string, token: string): Promise<boolean> {
	try {
		const isAdmin = await fetchQuery(
			api.admin.isSiteAdmin,
			{ school: subdomain },
			{ token },
		);
		return isAdmin;
	} catch {
		return false;
	}
}

/**
 * Check if user has permission to upload files
 * User must be either:
 * - Site admin, OR
 * - Course admin/editor (if courseId is provided)
 */
async function checkUploadPermission(
	courseId: string | undefined,
	subdomain: string,
	token: string,
): Promise<boolean> {
	// Check if user is site admin
	const isSiteAdmin = await checkSiteAdmin(subdomain, token);
	if (isSiteAdmin) {
		return true;
	}

	// If courseId is provided, check course permissions
	if (courseId) {
		const { authorized } = await checkAdminOrEditorPermission(
			courseId as Id<"courses">,
		);
		return authorized === true;
	}

	// If no courseId, only site admins can upload
	return false;
}

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const params = validator.parse({
			lessonId: searchParams.get("lessonId") || undefined,
			courseId: searchParams.get("courseId") || undefined,
			contentType: searchParams.get("contentType") || undefined,
			fileType: searchParams.get("fileType") || "pdf",
			fileName: searchParams.get("fileName") || undefined,
			fileSize: (() => {
				const sizeParam = searchParams.get("fileSize");
				return sizeParam ? Number.parseInt(sizeParam, 10) : undefined;
			})(),
		});

		// Validate file size if provided
		if (params.fileSize !== undefined) {
			const maxSize =
				params.fileType === "pdf" ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;
			if (params.fileSize > maxSize) {
				const maxSizeMB = Math.round(maxSize / (1024 * 1024));
				return Response.json(
					{
						error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
					},
					{ status: 400 },
				);
			}
			if (params.fileSize <= 0) {
				return Response.json(
					{ error: "Invalid file size" },
					{ status: 400 },
				);
			}
		}

		// Get auth token and subdomain
		const token = await getAuthToken();
		const subdomain = await extractSubdomain();

		if (!token) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (!subdomain) {
			return Response.json(
				{ error: "Subdomain not found" },
				{ status: 400 },
			);
		}

		// Check permissions
		const hasPermission = await checkUploadPermission(
			params.courseId,
			subdomain,
			token,
		);

		if (!hasPermission) {
			return Response.json({ error: "Forbidden" }, { status: 403 });
		}

		// Determine file path based on file type
		let filePath: string;
		if (params.fileType === "image") {
			// For images (e.g., site logo), use a timestamp-based path
			const timestamp = Date.now();
			const extension = params.contentType.includes("png")
				? "png"
				: params.contentType.includes("jpeg") || params.contentType.includes("jpg")
					? "jpg"
					: "webp";
			filePath = `images/${timestamp}.${extension}`;
		} else {
			// For PDFs, use lesson-based path
			// If lessonId is not provided (e.g., during lesson creation), use a temporary path
			if (!params.lessonId) {
				// Generate a temporary ID for the upload
				const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
				const fileName = params.fileName || "lesson.pdf";
				filePath = `lessons/${tempId}/${fileName}`;
			} else {
				const fileName = params.fileName || "lesson.pdf";
				filePath = `lessons/${params.lessonId}/${fileName}`;
			}
		}

		// Create command for this specific file
		// Add ContentLength condition if file size is provided to enforce limits
		const commandOptions: {
			Bucket: string;
			Key: string;
			ContentType: string;
			ContentLength?: number;
		} = {
			Bucket: env.RAILWAY_BUCKET,
			Key: filePath,
			ContentType: params.contentType,
		};

		// If file size is provided, add it to the command to enforce the limit
		if (params.fileSize !== undefined) {
			commandOptions.ContentLength = params.fileSize;
		}

		const command = new PutObjectCommand(commandOptions);

		// Get a presigned URL valid for 60 seconds
		const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

		// Prepare the public URL
		const endpoint = normalizedEndpoint.replace(/\/$/, "");
		const publicUrl = `${endpoint}/${env.RAILWAY_BUCKET}/${filePath}`;
		console.log("publicUrl", publicUrl);

		return Response.json({
			uploadUrl: signedUrl,
			publicUrl,
			filePath,
		});
	} catch (error) {
		console.error("Upload file error:", error);
		if (error instanceof z4.ZodError) {
			return Response.json(
				{ error: "Invalid request parameters", details: error.issues },
				{ status: 400 },
			);
		}
		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
