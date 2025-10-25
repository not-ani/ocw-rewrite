"use client";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Hero } from "@/components/home-page/hero";

export default function Page() {
	const sites = useQuery(api.site.getSites);
	return (
		<main className="container mx-auto max-w-5xl divide-y px-0 sm:border-x">
			<Hero />

			<section className="flex flex-col justify-center items-center py-4">
				<h1 className="font-bold text-3xl">Want to add your school?</h1>
				<Separator className="my-4 max-w-lg" />
				<p className="text-muted-foreground max-w-lg text-center text-lg leading-relaxed">
					If you want to add your school to the list, please fill out this form:{" "}
					<Link
						href="https://forms.gle/6uzDkmrrAqanHqVn7"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-foreground underline transition-colors"
					>
						here
					</Link>
					.
				</p>
			</section>

			<section className="flex flex-col justify-center items-center py-4">
				<h1 className="font-bold text-3xl">Schools</h1>
				<Separator className="my-4 max-w-lg" />

				<div className="grid grid-cols-2 gap-4">
					{sites ? (
						sites.map((site) => (
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
					) : (
						<>
							<Skeleton className="h-10 w-full" />

							<Skeleton className="h-10 w-full" />

							<Skeleton className="h-10 w-full" />

							<Skeleton className="h-10 w-full" />
						</>
					)}
				</div>
			</section>
		</main>
	);
}
