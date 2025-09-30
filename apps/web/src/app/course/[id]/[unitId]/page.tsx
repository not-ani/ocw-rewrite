
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { preloadQuery } from "convex/nextjs";
import { UnitPageClient } from "./client";

export default async function Page({
  params
}: {
  params: Promise<{ id: string; unitId: string }>
}) {
  const { unitId } = await params;

  const preloadedUnit = await preloadQuery(api.units.getUnitWithLessons, {
    id: unitId as Id<"units">
  })

  return (
    <UnitPageClient
      preloadedUnit={preloadedUnit}
    />
  )
}
