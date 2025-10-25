"use client";
import type { LucideIcon } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

interface StatsCardProps {
	title: string;
	value: string | number;
	icon: LucideIcon;
	trend?: {
		value: number;
		isPositive: boolean;
	};
}

export function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {
	return (
		<Card className="border-border/50 bg-card/50 backdrop-blur-sm">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="font-medium text-muted-foreground text-sm">
					{title}
				</CardTitle>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="font-bold text-2xl">{value.toLocaleString()}</div>
				{trend && (
					<p
						className={`text-xs ${trend.isPositive ? "text-emerald-500" : "text-red-500"}`}
					>
						{trend.isPositive ? "+" : ""}
						{trend.value}% from last period
					</p>
				)}
			</CardContent>
		</Card>
	);
}

export type MonthlyTraffic = {
	month: string;
	pageviews: number;
	users: number;
};

interface TrafficChartProps {
	data: MonthlyTraffic[];
}

export function TrafficChart({ data }: TrafficChartProps) {
	return (
		<Card className="border-border/50 bg-card/50 backdrop-blur-sm">
			<CardHeader>
				<CardTitle>Traffic Trends</CardTitle>
				<CardDescription>
					Monthly pageviews and unique visitors over the last 6 months
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer
					config={{
						pageviews: {
							label: "Pageviews",
							color: "hsl(var(--chart-1))",
						},
						users: {
							label: "Visitors",
							color: "hsl(var(--chart-3))",
						},
					}}
					className="h-[300px] w-full"
				>
					<AreaChart
						data={data}
						margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
					>
						<defs>
							<linearGradient id="fillPageviews" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="hsl(var(--chart-1))"
									stopOpacity={0.3}
								/>
								<stop
									offset="95%"
									stopColor="hsl(var(--chart-1))"
									stopOpacity={0}
								/>
							</linearGradient>
							<linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="hsl(var(--chart-2))"
									stopOpacity={0.3}
								/>
								<stop
									offset="95%"
									stopColor="hsl(var(--chart-2))"
									stopOpacity={0}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
						<XAxis
							dataKey="month"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							className="text-xs"
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							className="text-xs"
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						<Area
							type="monotone"
							dataKey="pageviews"
							stroke="hsl(var(--chart-1))"
							fill="url(#fillPageviews)"
							strokeWidth={2}
						/>
						<Area
							type="monotone"
							dataKey="users"
							stroke="hsl(var(--chart-2))"
							fill="url(#fillUsers)"
							strokeWidth={2}
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
