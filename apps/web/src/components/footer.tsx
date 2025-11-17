"use client";
import { useSite } from "@/lib/multi-tenant/context";
import { SignInButton } from "@clerk/nextjs";
import type { Route } from "next";
import Link from "next/link";

export default function FooterSections() {
	const { siteConfig } = useSite();
	const footerData = [
		{
			title: "About Us",
			content:
				"OpenCourseWare is dedicated to providing free, high-quality education to learners worldwide.",
		},
		{
			title: "Quick Links",
			links: [
				{ text: "Home", href: "/" },
				{ text: "Courses", href: "/courses" },
				{ text: "About", href: "/about" },
				{ text: "Contact", href: "/contact" },
			],
		},
		...(siteConfig?.instagramUrl ? [
			{
				title: "Connect With Us",
				links: [
					{ text: "Instagram", href: siteConfig.instagramUrl as string },
				],
			}
		] : []),
	];

	return (
		<>
			{footerData.map((section) => (
				<div key={section.title}>
					<h5 className="mb-4 font-semibold text-lg">{section.title}</h5>
					{section.content && (
						<p className="text-muted-foreground text-sm">{section.content}</p>
					)}
					{section.links && (
						<nav className="space-y-2">
							{section.links.map((link) => (
								<Link
									key={link.text}
									href={link.href as Route}
									prefetch
									className="block text-muted-foreground text-sm hover:text-primary"
									{...(link.href.startsWith("http")
										? { target: "_blank", rel: "noopener noreferrer" }
										: {})}
								>
									{link.text}
								</Link>
							))}
						</nav>
					)}
				</div>
			))}
			<div>
				<h5 className="mb-4 font-semibold text-lg">Authentication</h5>
				<nav>
					<SignInButton />
				</nav>
			</div>
		</>
	);
}
