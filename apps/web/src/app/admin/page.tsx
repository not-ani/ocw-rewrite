import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { getAuthToken } from "@/lib/auth";
import { AdminPageClient } from "./client";
import { redirect } from "next/navigation";
import { extractSubdomain } from "@/lib/multi-tenant/server";

export default async function AdminPage() {
  const token = await getAuthToken();
  const subdomain = await extractSubdomain();

  if (!subdomain) {
    redirect("/");
  }

  if (!token) {
    redirect("/");
  }

  const isSiteAdmin = await fetchQuery(
    api.admin.isSiteAdmin,
    { school: subdomain },
    { token },
  );

  if (!isSiteAdmin) {
    redirect("/");
  }

  const preloadedCourses = await preloadQuery(
    api.admin.getAllCourses,
    { school: subdomain },
    { token },
  );

  const preloadedAdmins = await preloadQuery(
    api.admin.getAllSiteAdmins,
    { school: subdomain },
    { token },
  );

  return (
    <div className="bg-background min-h-screen">
      <AdminPageClient
        preloadedCourses={preloadedCourses}
        preloadedAdmins={preloadedAdmins}
      />
    </div>
  );
}
