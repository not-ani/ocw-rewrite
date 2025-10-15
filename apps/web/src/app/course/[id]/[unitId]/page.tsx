
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { preloadQuery } from "convex/nextjs";
import { UnitPageClient } from "./client";
import { extractSubdomain } from "@/lib/multi-tenant/server";

export default async function Page({
  params
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
    school: subdomain
  })

  return (
    <UnitPageClient
      preloadedUnit={preloadedUnit}
    />
  )
}
