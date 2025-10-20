import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { preloadQuery } from "convex/nextjs";
import { UnitPageClient } from "./client";
import type { Metadata } from "next";
import { getAuthToken } from "@/lib/auth";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { notFound } from "next/navigation";
import { isValidConvexId } from "@/lib/convex-utils";

export async function generateMetadata({
  params: _params,
}: {
  params: Promise<{ id: string; unitId: string }>;
}): Promise<Metadata> {
  return {
    title: "Edit Unit",
    description: "Manage unit settings and lessons",
  };
}

export default async function UnitPage({
  params,
}: {
  params: Promise<{ id: string; unitId: string }>;
}) {
  const { id, unitId } = await params;

  const token = await getAuthToken();
  const subdomain = await extractSubdomain();

  if (!subdomain) {
    return null;
  }

  if (!isValidConvexId(id) || !isValidConvexId(unitId)) {
    notFound();
  }

  const courseId = id as Id<"courses">;

  const [preloadedUnit, preloadedLessons] = await Promise.all([
    preloadQuery(
      api.units.getById,
      {
        id: unitId as Id<"units">,
        school: subdomain,
      },
      { token: token },
    ),
    preloadQuery(
      api.lesson.getByUnit,
      {
        unitId: unitId as Id<"units">,
        school: subdomain,
      },
      { token: token },
    ),
  ]);

  return (
    <UnitPageClient
      courseId={courseId}
      unitId={unitId as Id<"units">}
      preloadedUnit={preloadedUnit}
      preloadedLessons={preloadedLessons}
    />
  );
}
