import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { checkAdminOrEditorPermission } from "@/lib/permissions";
import { isValidConvexId } from "@/lib/convex-utils";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { UnitPageClient } from "./client";

export const metadata: Metadata = {
  title: "Edit Unit",
  description: "Manage unit settings and lessons",
};

export default async function UnitPage({
  params,
}: {
  params: Promise<{ id: string; unitId: string }>;
}) {
  const { id, unitId } = await params;

  const subdomain = await extractSubdomain();

  if (!subdomain) {
    return null;
  }

  if (!isValidConvexId(id) || !isValidConvexId(unitId)) {
    notFound();
  }

  const courseId = id as Id<"courses">;

  const { authorized } = await checkAdminOrEditorPermission(courseId);

  if (!authorized) {
    redirect("/unauthorized");
  }

  return (
    <UnitPageClient
      courseId={courseId}
      unitId={unitId as Id<"units">}
      subdomain={subdomain}
    />
  );
}
