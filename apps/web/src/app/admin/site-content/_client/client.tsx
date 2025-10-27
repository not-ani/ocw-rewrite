"use client";

import type { api } from "@ocw/backend/convex/_generated/api";
import { type Preloaded, usePreloadedQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { BasicInformationCard } from "./basic-information-card";
import { ClubInformationCard } from "./club-information-card";
import { ContactPersonsCard } from "./contact-persons-card";
import { ContributorsCard } from "./contributors-card";

type SiteContentClientProps = {
	school: string;
	preloadedSiteConfig: Preloaded<typeof api.site.getSiteConfig>;
};

export function SiteContentClient({
	school,
	preloadedSiteConfig,
}: SiteContentClientProps) {
	const siteConfig = usePreloadedQuery(preloadedSiteConfig);

	if (siteConfig === undefined) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (siteConfig === null) {
		return (
			<div className="p-8">
				<Card>
					<CardHeader>
						<CardTitle>Site Configuration Not Found</CardTitle>
						<CardDescription>
							No site configuration exists for school: {school ?? "unknown"}
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="font-bold text-3xl">Site Content Management</h1>
				<p className="text-muted-foreground">
					Edit site configuration for:{" "}
					<span className="font-semibold">{siteConfig.school}</span>
				</p>
			</div>

			<BasicInformationCard
				school={siteConfig.school}
				schoolName={siteConfig.schoolName || ""}
				siteHero={siteConfig.siteHero || ""}
				siteLogo={siteConfig.siteLogo || ""}
				siteContributeLink={siteConfig.siteContributeLink || ""}
			/>

			<ClubInformationCard
				school={siteConfig.school}
				clubName={siteConfig.club?.name || ""}
				clubEmail={siteConfig.club?.email || ""}
			/>

			<ContributorsCard
				school={siteConfig.school}
				contributors={siteConfig.contributors || []}
			/>

			<ContactPersonsCard
				school={siteConfig.school}
				contacts={siteConfig.personsContact || []}
			/>
		</div>
	);
}
