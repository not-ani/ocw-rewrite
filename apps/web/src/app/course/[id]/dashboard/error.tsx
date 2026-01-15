"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@ocw/ui/button";

export default function DashboardError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("Dashboard error:", error);
	}, [error]);

	return (
		<div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
			<AlertCircle className="h-12 w-12 text-destructive" />
			<h2 className="font-semibold text-2xl">Dashboard Error</h2>
			<p className="max-w-md text-muted-foreground">
				We encountered an error loading the dashboard. Please try again or
				return to the course page.
			</p>
			<div className="flex gap-3">
				<Button onClick={reset} variant="outline">
					<RefreshCw className="mr-2 h-4 w-4" />
					Try again
				</Button>
				<Button asChild variant="secondary">
					<Link href="/courses">Back to Courses</Link>
				</Button>
			</div>
			{error.digest && (
				<p className="mt-4 font-mono text-muted-foreground text-xs">
					Error ID: {error.digest}
				</p>
			)}
		</div>
	);
}
