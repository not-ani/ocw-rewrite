"use client";
import { ArrowLeft, Home, ShieldX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@ocw/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@ocw/ui/card";

export default function UnauthorizedPage() {
	const router = useRouter();

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
			{/* Background pattern */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="-left-32 -top-32 absolute h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
				<div className="-bottom-32 -right-32 absolute h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
				<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-64 w-64 rounded-full bg-destructive/5 blur-3xl" />
				{/* Grid pattern */}
				<svg
					className="absolute inset-0 h-full w-full opacity-[0.015]"
					xmlns="http://www.w3.org/2000/svg"
				>
					<defs>
						<pattern
							id="grid"
							width="32"
							height="32"
							patternUnits="userSpaceOnUse"
						>
							<path
								d="M0 32V0h32"
								fill="none"
								stroke="currentColor"
								strokeWidth="1"
							/>
						</pattern>
					</defs>
					<rect width="100%" height="100%" fill="url(#grid)" />
				</svg>
			</div>

			{/* Content */}
			<Card className="relative w-full max-w-md border-border/50 bg-card/80 shadow-xl backdrop-blur-sm">
				<CardHeader className="pb-4 text-center">
					<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
						<ShieldX className="size-8 text-destructive" />
					</div>
					<CardTitle className="font-bold text-2xl tracking-tight">
						Access Denied
					</CardTitle>
					<CardDescription className="text-base text-muted-foreground">
						You don&apos;t have permission to view this page
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4 px-6 pb-2">
					<div className="rounded-lg border border-border/50 bg-muted/30 p-4">
						<p className="text-muted-foreground text-sm leading-relaxed">
							This area is restricted to authorized users only. If you believe
							this is an error, please contact your administrator or try signing
							in with a different account.
						</p>
					</div>

					<div className="flex flex-col gap-2 text-muted-foreground text-xs">
						<div className="flex items-center gap-2">
							<div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
							<span>Check if you&apos;re signed in to the correct account</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
							<span>Request access from a course or site administrator</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
							<span>Navigate back to an area you have access to</span>
						</div>
					</div>
				</CardContent>

				<CardFooter className="flex flex-col gap-3 px-6 pt-4">
					<div className="flex w-full gap-3">
						<Button
							variant="outline"
							className="flex-1"
							onClick={() => router.back()}
						>
							<ArrowLeft className="mr-2 size-4" />
							Go Back
						</Button>
						<Button className="flex-1" asChild>
							<Link href="/">
								<Home className="mr-2 size-4" />
								Home
							</Link>
						</Button>
					</div>
				</CardFooter>
			</Card>

			{/* Error code badge */}
			<div className="-translate-x-1/2 absolute bottom-8 left-1/2">
				<div className="rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 font-mono text-muted-foreground text-xs backdrop-blur-sm">
					ERROR 403 — FORBIDDEN
				</div>
			</div>
		</div>
	);
}
