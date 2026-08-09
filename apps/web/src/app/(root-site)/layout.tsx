import { cacheLife } from "next/cache";
import Link from "next/link";

import { Header } from "@/components/home-page/header";

async function Copyright() {
	"use cache";
	cacheLife("days");
	return (
		<p className="text-muted-foreground text-sm" data-testid="copyright">
			© {new Date().getFullYear()} OCW Project. All rights reserved.
		</p>
	);
}

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div className="container mx-auto max-w-5xl divide-y px-0 sm:border-x">
			<Header />
			{children}
			<footer className="px-4 py-6 sm:px-8">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<Copyright />
					<div className="flex gap-6 text-sm">
						<Link
							href="/terms"
							className="text-muted-foreground hover:text-foreground transition-colors"
							as="/terms"
						>
							Terms of Service
						</Link>
						<Link
							href="/privacy"
							className="text-muted-foreground hover:text-foreground transition-colors"
							as="/privacy"
						>
							Privacy Policy
						</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}
