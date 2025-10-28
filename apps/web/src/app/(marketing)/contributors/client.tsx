"use client";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type SiteConfig = {
	schoolName: string;
	contributors?: {
		name: string;
		role: string;
		avatar: string;
		description: string;
	}[];
} | null;

export function WritersTableClient({
	siteConfig,
}: {
	siteConfig: SiteConfig;
}) {
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const handleRowClick = (id: string) => {
		setExpandedId(expandedId === id ? null : id);
	};

	return (
		<main className="min-h-screen bg-background">
			<div className="mx-auto max-w-4xl">
				<div className="overflow-hidden rounded-2xl bg-background">
					<div className="px-8 py-6">
						<div className="grid grid-cols-12 items-center gap-4">
							<div className="col-span-1" />
							<div className="col-span-5">
								<span className="font-semibold text-gray-600 text-sm uppercase tracking-wide">
									Name
								</span>
							</div>
							<div className="col-span-5">
								<span className="font-semibold text-gray-600 text-sm uppercase tracking-wide">
									Role
								</span>
							</div>
							<div className="col-span-1" />
						</div>
					</div>

					<div className="divide-y divide-gray-100">
						{siteConfig?.contributors?.map((writer) => (
							<div className="group relative" key={writer.name}>
								<button
									aria-expanded={expandedId === writer.name}
									type="button"
									aria-label={`${
										expandedId === writer.name ? "Collapse" : "Expand"
									} details for ${writer.name}`}
									className={`cursor-pointer px-8 py-6 transition-all duration-300 ease-out ${
										expandedId === writer.name ? "text-primary/30" : ""
									}`}
									onClick={() => handleRowClick(writer.name)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											handleRowClick(writer.name);
										}
									}}
									tabIndex={0}
								>
									<div className="grid grid-cols-12 items-center gap-4">
										{/* Avatar */}
										<div className="col-span-1">
											<div
												className={`relative transition-all duration-300 ease-out ${
													expandedId === writer.name
														? "scale-75 opacity-0"
														: "scale-100 opacity-100"
												}`}
											>
												<Image
													height={100}
													width={100}
													alt={writer.name}
													className="h-10 w-10 rounded-full object-cover shadow-sm ring-2 ring-white transition-all duration-300 hover:ring-gray-200"
													src={writer.avatar}
												/>
											</div>
										</div>

										<div className="col-span-5">
											<h3
												className={`font-semibold transition-all duration-300 group-hover:text-foreground ${
													expandedId === writer.name
														? "text-foreground"
														: "text-muted-foreground"
												}`}
											>
												{writer.name}
											</h3>
										</div>

										<div className="col-span-5">
											<span
												className={`transition-all duration-300 group-hover:text-foreground/90 ${
													expandedId === writer.name
														? "font-medium text-accent-foreground/80"
														: "text-muted-foreground"
												}`}
											>
												{writer.role}
											</span>
										</div>

										<div className="col-span-1 flex justify-end">
											<div
												className={
													"text-muted-foreground transition-all duration-300 group-hover:text-foreground/90"
												}
											>
												{expandedId === writer.name ? (
													<ChevronUp className="h-5 w-5" />
												) : (
													<ChevronDown className="h-5 w-5" />
												)}
											</div>
										</div>
									</div>
								</button>

								<div
									className={`overflow-hidden transition-all duration-500 ease-out ${
										expandedId === writer.name
											? "max-h-96 opacity-100"
											: "max-h-0 opacity-0"
									}`}
								>
									<div className="px-8 pt-6 pb-8">
										<div className="mx-auto max-w-2xl">
											<div
												className={`transform transition-all duration-500 ease-out ${
													expandedId === writer.name
														? "translate-y-0 opacity-100"
														: "translate-y-4 opacity-0"
												}`}
											>
												<div className="overflow-hidden rounded-2xl border">
													<div className="relative h-48 bg-primary-foreground">
														<div className="absolute inset-0 flex items-center justify-center">
															<Image
																alt={writer.name}
																height={240}
																width={240}
																className="h-24 w-24 rounded-xl object-cover shadow-lg ring-4"
																src={writer.avatar}
															/>
														</div>
													</div>

													<div className="p-6">
														<div className="mb-4 text-center">
															<h3 className="mb-1 font-bold text-xl">
																{writer.name}
															</h3>
															<span className="font-medium text-primary/70">
																{writer.role}
															</span>
														</div>

														<p className="text-primary/30 text-sm leading-relaxed">
															{writer.description}
														</p>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</main>
	);
}

