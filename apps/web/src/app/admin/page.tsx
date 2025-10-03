import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { getAuthToken } from "@/lib/auth";
import { AdminPageClient } from "./client";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const token = await getAuthToken();

  if (!token) {
    redirect("/");
  }

  // Check if user is a site admin
  const isSiteAdmin = await fetchQuery(
    api.admin.isSiteAdmin,
    {},
    { token }
  );

  if (!isSiteAdmin) {
    redirect("/");
  }

  const preloadedCourses = await preloadQuery(
    api.admin.getAllCourses,
    {},
    { token }
  );

  const preloadedAdmins = await preloadQuery(
    api.admin.getAllSiteAdmins,
    {},
    { token }
  );

  return (
    <div className="min-h-screen bg-background">
      <AdminPageClient
        preloadedCourses={preloadedCourses}
        preloadedAdmins={preloadedAdmins}
      />
    </div>
  );
}

