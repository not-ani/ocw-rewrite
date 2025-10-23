import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { preloadQuery } from "convex/nextjs";
import { UnitPageClient } from "./client";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { isValidConvexId } from "@/lib/convex-utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; unitId: string }>;
}): Promise<Metadata> {
  const { unitId } = await params;
  const subdomain = await extractSubdomain();
  
  if (!subdomain || !isValidConvexId(unitId)) {
    return {
      title: "Unit | OpenCourseWare",
      description: "View unit content and lessons",
    };
  }

  try {
    const preloadedUnit = await preloadQuery(api.units.getUnitMetadata, {
      id: unitId as Id<"units">,
    });

    const unitName = preloadedUnit?.name || "Unit";

    return {
      title: `${unitName} | OpenCourseWare`,
      description: `View and study ${unitName} content and lessons`,
    };
  } catch {
    return {
      title: "Unit | OpenCourseWare",
      description: "View unit content and lessons",
    };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; unitId: string }>;
}) {
  const { unitId } = await params;
  const subdomain = await extractSubdomain();
  if (!subdomain) {
    return null;
  }

  const preloadedUnit = await preloadQuery(api.units.getUnitWithLessons, {
    id: unitId as Id<"units">,
  });

  return <UnitPageClient preloadedUnit={preloadedUnit} />;
}
