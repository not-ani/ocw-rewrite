"use client";

import { Activity, Eye, Users } from "lucide-react";
import { StatsCard } from "@/components/linear-chart";

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
