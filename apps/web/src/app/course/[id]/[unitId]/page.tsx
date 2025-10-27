import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { preloadQuery } from "convex/nextjs";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import { UnitPageClient } from "./client";

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
