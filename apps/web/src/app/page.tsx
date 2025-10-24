"use client";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
	const sites = useQuery(api.site.getSites);
	return (
		<div className="container mx-auto flex h-screen w-full flex-col items-center gap-4 pt-10">
			<Image alt="logo" src="/rael-logo.svg" height={300} width={300} />
			<h1 className="font-bold text-4xl"> The OpenCourseWare Project </h1>
			<p className="max-w-lg text-center text-lg text-muted-foreground leading-relaxed">
				OCW is a multi-tenant, school-agnostic platform that empowers educators
				to create, share, and distribute high-quality educational content. Built
				with modern web technologies, it provides a seamless experience for both
				content creators and learners.
			</p>
			<p className="text-muted-foreground text-sm">
				A project of{" "}
				<Link
					href="https://csforco.org"
					target="_blank"
					rel="noopener noreferrer"
					className="underline transition-colors hover:text-foreground"
				>
					CS for CO
				</Link>
			</p>
			<Separator className="my-4 max-w-lg" />
			<h1 className="font-bold text-3xl">Want to add your school?</h1>
			<p className="max-w-lg text-center text-lg text-muted-foreground leading-relaxed">
				If you want to add your school to the list, please fill out this form:{" "}
				<Link
					href="https://forms.gle/6uzDkmrrAqanHqVn7"
					target="_blank"
					rel="noopener noreferrer"
					className="underline transition-colors hover:text-foreground"
				>
					here
				</Link>
				.
			</p>

			<Separator className="my-4 max-w-lg" />
			<h1 className="font-bold text-3xl">Schools</h1>

			{/* View Analytics Button */}
			<Button asChild variant="outline" className="mb-4">
				<Link href="/analytics">View Analytics</Link>
			</Button>
			<div className="grid grid-cols-2 gap-4">
				{sites
					? sites.map((site) => (
							<Card
								key={site.school}
								className="flex flex-col items-center justify-center"
							>
								<CardContent>
									<Link href={`https://${site.school}.ocwproject.org`}>
										{site.schoolName}
									</Link>
								</CardContent>
							</Card>
						))
					: Array.from({ length: 4 }).map((_, index) => (
							<Skeleton key={index} className="h-10 w-full" />
						))}
			</div>
		</div>
	);
}
