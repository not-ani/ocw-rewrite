"use client";

import { Activity, Eye, Users } from "lucide-react";
import dynamic from "next/dynamic";

const StatsCard = dynamic(
	() => import("@/components/linear-chart").then((mod) => mod.StatsCard),
	{
		ssr: false,
		loading: () => (
			<div className="h-[106px] animate-pulse rounded-lg bg-muted" />
		),
	},
);

export function Statis({
	pageviews,
	visitors,
}: {
	pageviews: number;
	visitors: number;
}) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<StatsCard
				title="Total Pageviews"
				value={pageviews}
				icon={Eye}
				trend={{ value: 12.5, isPositive: true }}
			/>
			<StatsCard
				title="Unique Visitors (Users)"
				value={visitors}
				icon={Users}
				trend={{ value: 8.2, isPositive: true }}
			/>
			<StatsCard
				title="Active Sessions"
				value={Math.floor(visitors * 0.15)}
				icon={Activity}
				trend={{ value: -2.4, isPositive: false }}
			/>
		</div>
	);
}
