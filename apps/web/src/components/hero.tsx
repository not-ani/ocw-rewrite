"use client";
import Link from "next/link";
import { Button } from "@ocw/ui/button";
import { useSite } from "@/lib/multi-tenant/context";

export function HeroSection() {
	const { siteConfig } = useSite();
	return (
		<section className="relative h-[38vh]">
			<div className="container relative z-auto mx-auto flex flex-col gap-5 px-4 text-center">
				<h2 className="mb-8 font-extrabold text-4xl text-foreground sm:text-5xl lg:text-6xl">
					{siteConfig?.schoolName ?? "OpenCourseWare"} OpenCourseWare
				</h2>
				<div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
					<Button size="lg" className="" asChild>
						<Link prefetch href="/courses">
							See All Courses
						</Link>
					</Button>
					<Button size="lg" variant="outline" className="" asChild>
						<Link href="/about">Learn About Us</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
