import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import z from "zod";
import { env } from "@/env";
import { getAuthToken } from "@/lib/auth";

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

const schema = z.object({
	fileUrl: z.string().url().optional(),
	filePath: z.string().optional(),
});

function extractKey(params: { fileUrl?: string; filePath?: string }): string {
	if (params.filePath) {
		return params.filePath.replace(/^\/+/, "");
	}

	if (!params.fileUrl) {
		throw new Error("fileUrl or filePath is required");
	}

	const url = new URL(params.fileUrl);
	const path = url.pathname.replace(/^\/+/, "");
	const segments = path.split("/");

	// public URLs are path-style: <endpoint>/<bucket>/<key>
	if (segments[0] === env.RAILWAY_BUCKET) {
		segments.shift();
	}

	if (segments.length === 0) {
		throw new Error("Could not derive key from URL");
	}

	return segments.join("/");
}

export async function GET(request: Request) {
	try {
		const token = await getAuthToken();
		if (!token) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const parsed = schema.parse({
			fileUrl: searchParams.get("fileUrl") ?? undefined,
			filePath: searchParams.get("filePath") ?? undefined,
		});

		const Key = extractKey(parsed);

		const command = new GetObjectCommand({
			Bucket: env.RAILWAY_BUCKET,
			Key,
		});

		const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

		return NextResponse.json({ signedUrl, key: Key });
	} catch (error) {
		console.error("Failed to generate signed file URL", error);
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request parameters", details: error.issues },
				{ status: 400 },
			);
		}
		return NextResponse.json(
			{ error: "Unable to generate access URL" },
			{ status: 500 },
		);
	}
}
