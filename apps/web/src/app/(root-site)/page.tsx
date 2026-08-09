import { ArrowRight, ArrowUpRight, School, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Hero } from "@/components/home-page/hero";
import { getPublicSites } from "@/lib/public-data";
import { Button } from "@ocw/ui/button";

export const metadata: Metadata = {
	title: "The OpenCourseWare Project",
	description:
		"The OpenCourseWare Project is a platform for free, high-quality resources for free",
};

// Gradient presets for school cards
const gradients = [
	"from-indigo-500/20 via-blue-500/15 to-cyan-500/20",
	"from-emerald-500/20 via-green-500/15 to-teal-500/20",
	"from-rose-500/20 via-pink-500/15 to-fuchsia-500/20",
	"from-amber-500/20 via-orange-500/15 to-yellow-500/20",
	"from-violet-500/20 via-purple-500/15 to-indigo-500/20",
	"from-sky-500/20 via-cyan-500/15 to-blue-500/20",
];

function SchoolCard({
	school,
	schoolName,
	index,
}: {
	school: string;
	schoolName: string;
	index: number;
}) {
	const gradient = gradients[index % gradients.length];

	return (
		<Link
			href={`https://${school}.ocwproject.org`}
			className="group relative flex flex-col justify-between overflow-hidden p-6 transition-all duration-500 md:p-8"
		>
			{/* Subtle gradient background on hover */}
			<div
				className={`pointer-events-none absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${gradient}`}
			/>

			{/* Content */}
			<div className="relative z-10">
				{/* Icon */}
				<div
					className={`border-border/50 relative mb-6 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border bg-linear-to-br transition-transform duration-500 group-hover:scale-105 ${gradient}`}
				>
					<School className="text-foreground/70 group-hover:text-foreground h-7 w-7 transition-colors" />
				</div>

				{/* Info */}
				<div className="space-y-2">
					<h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
						{schoolName}
						<ArrowUpRight className="text-muted-foreground h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
					</h3>
					<p className="text-muted-foreground text-sm font-medium">
						{school}.ocwproject.org
					</p>
				</div>
			</div>
		</Link>
	);
}

export default async function Page() {
	const sites = await getPublicSites();

	return (
		<main className="divide-y">
			<Hero />

			{/* Schools Section */}
			<section>
				<div className="sm:grid sm:grid-cols-12 sm:divide-x">
					<div />
					<div className="col-span-10 px-4 py-16 sm:px-8">
						<div className="mx-auto max-w-3xl text-center">
							<div className="bg-primary/10 text-primary mx-auto mb-4 w-fit rounded-full px-4 py-1.5 text-sm font-medium">
								Partner Schools
							</div>
							<h2 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
								Explore Our Network
							</h2>
							<p className="text-muted-foreground leading-relaxed">
								Educational resources from schools across the country, all in
								one place.
							</p>
						</div>
					</div>
					<div className="border-r-0" />
				</div>

				<div className="sm:grid sm:grid-cols-12 sm:divide-x">
					<div />
					<div className="col-span-10">
						{/* Grid of schools - rows of 3 */}
						{Array.from({ length: Math.ceil(sites.length / 3) }).map(
							(_, rowIndex) => {
								const rowSites = sites.slice(rowIndex * 3, rowIndex * 3 + 3);
								return (
									<div key={rowIndex}>
										{rowIndex > 0 && <div className="border-t" />}
										<div className="grid divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
											{rowSites.map((site, index) => (
												<SchoolCard
													key={site.school}
													school={site.school}
													schoolName={site.schoolName}
													index={rowIndex * 3 + index}
												/>
											))}
											{/* Fill empty slots on last row */}
											{rowSites.length < 3 &&
												Array.from({ length: 3 - rowSites.length }).map(
													(_, i) => (
														<div
															key={`empty-${i}`}
															className="hidden md:block"
														/>
													),
												)}
										</div>
									</div>
								);
							},
						)}
					</div>
					<div className="border-r-0" />
				</div>
			</section>

			{/* Add Your School CTA */}
			<section>
				<div className="sm:grid sm:grid-cols-12 sm:divide-x">
					<div />
					<div className="col-span-10">
						<div className="grid divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
							{/* Left: Visual */}
							<div className="from-primary/5 via-background to-primary/10 relative flex min-h-[280px] items-center justify-center overflow-hidden bg-gradient-to-br p-8">
								{/* Decorative elements */}
								<div className="bg-primary/10 absolute -top-8 -left-8 h-32 w-32 rounded-full blur-3xl" />
								<div className="bg-primary/5 absolute -right-8 -bottom-8 h-40 w-40 rounded-full blur-3xl" />

								{/* Grid pattern */}
								<div
									className="absolute inset-0 opacity-[0.03]"
									style={{
										backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                                    linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
										backgroundSize: "24px 24px",
									}}
								/>

								{/* Stacked cards visual */}
								<div className="relative">
									<div className="border-border bg-muted/30 absolute -top-4 -left-4 h-20 w-20 rotate-[-15deg] rounded-2xl border backdrop-blur-sm" />
									<div className="border-border bg-muted/50 absolute -top-2 -right-2 h-20 w-20 rotate-[8deg] rounded-2xl border backdrop-blur-sm" />
									<div className="border-primary/30 bg-background relative flex h-24 w-24 items-center justify-center rounded-2xl border shadow-lg">
										<Sparkles className="text-primary h-10 w-10" />
									</div>
								</div>
							</div>

							{/* Right: Content */}
							<div className="flex flex-col justify-center p-8 md:p-12">
								<h2 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
									Add Your School
								</h2>
								<p className="text-muted-foreground mb-8 leading-relaxed">
									Want to bring OCW to your school? We&apos;re always looking to
									expand our network of partner institutions. Join us in making
									education more accessible.
								</p>
								<div className="flex flex-wrap gap-4">
									<Button asChild size="lg">
										<a
											href="https://forms.gle/6uzDkmrrAqanHqVn7"
											target="_blank"
											rel="noopener noreferrer"
										>
											Apply Now
											<ArrowRight className="ml-2 h-4 w-4" />
										</a>
									</Button>
									<Button variant="outline" asChild size="lg">
										<a href="/team">Meet the Team</a>
									</Button>
								</div>
							</div>
						</div>
					</div>
					<div className="border-r-0" />
				</div>
			</section>

			{/* Stats/Impact Section */}
			<section>
				<div className="sm:grid sm:grid-cols-12 sm:divide-x">
					<div />
					<div className="col-span-10">
						<div className="grid divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
							{[
								{
									value: `${sites.length}+`,
									label: "Partner Schools",
									icon: "◆",
								},
								{ value: "100%", label: "Free & Open", icon: "◇" },
								{ value: "24/7", label: "Always Available", icon: "○" },
							].map((stat, index) => (
								<div
									key={stat.label}
									className="group flex flex-col items-center justify-center p-8 text-center transition-colors md:p-12"
								>
									<div className="border-border bg-muted/30 group-hover:border-primary/50 group-hover:bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border text-xl transition-all duration-300">
										<span className="text-primary">{stat.icon}</span>
									</div>
									<div className="text-3xl font-semibold tracking-tight md:text-4xl">
										{stat.value}
									</div>
									<div className="text-muted-foreground mt-2 text-sm">
										{stat.label}
									</div>
								</div>
							))}
						</div>
					</div>
					<div className="border-r-0" />
				</div>
			</section>

			{/* Mission Quote */}
			<section>
				<div className="sm:grid sm:grid-cols-12 sm:divide-x">
					<div />
					<div className="col-span-10 px-4 py-16 text-center sm:px-8 md:py-20">
						<blockquote className="mx-auto max-w-2xl">
							<p className="text-muted-foreground text-xl leading-relaxed font-medium italic md:text-2xl">
								&ldquo;Knowledge, like air, is vital to life. And like air, no
								one should be denied it.&rdquo;
							</p>
							<footer className="text-muted-foreground/70 mt-6 text-sm">
								— Alan Moore
							</footer>
						</blockquote>
					</div>
					<div className="border-r-0" />
				</div>
			</section>
		</main>
	);
}
