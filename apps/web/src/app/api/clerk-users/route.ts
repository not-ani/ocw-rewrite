import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth";
import { fetchQuery } from "convex/nextjs";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { extractSubdomain } from "@/lib/multi-tenant/server";

export async function GET() {
  const subdomain = await extractSubdomain();
  if (!subdomain) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a site admin
    const isSiteAdmin = await fetchQuery(
      api.admin.isSiteAdmin,
      { school: subdomain },
      { token },
    );

    if (!isSiteAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const client = await clerkClient();
    const { data: users } = await client.users.getUserList({
      limit: 100,
      orderBy: "-created_at",
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress ?? "",
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      fullName:
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
        "Unknown User",
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching Clerk users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
