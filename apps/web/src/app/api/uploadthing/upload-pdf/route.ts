import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UTApi } from "uploadthing/server";

/**
 * API route to upload a PDF file programmatically
 * This is used by the migration to upload PDFs from Google Drive
 */
export async function POST(request: NextRequest) {
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		// Get the file from the request
		const formData = await request.formData();
		const file = formData.get("file") as File | null;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}
		if (file.type !== "application/pdf") {
			return NextResponse.json(
				{ error: "Only PDF files are supported" },
				{ status: 400 },
			);
		}

		// Initialize UploadThing API
		const utapi = new UTApi();

		// Upload the file
		const uploadResult = await utapi.uploadFiles(file);

		if (uploadResult.error) {
			console.error("UploadThing upload failed:", uploadResult.error);
			return NextResponse.json({ error: "Upload failed" }, { status: 500 });
		}

		return NextResponse.json({
			success: true,
			url: uploadResult.data.url,
			name: uploadResult.data.name,
		});
	} catch (error) {
		console.error("Error uploading PDF:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
			},
			{ status: 500 },
		);
	}
}
