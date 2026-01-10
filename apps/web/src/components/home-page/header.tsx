import Image from "next/image";
import { LinkTabs, LinkTabsList, LinkTabsTab } from "@ocw/ui/link-tabs";

export const Header = () => (
	<div className="sticky top-0 z-10 flex items-center justify-between bg-secondary p-4 backdrop-blur-sm dark:bg-background">
		<div className="mx-auto flex items-center gap-1 sm:mx-0">
			<a className="flex items-center gap-1" href="https://csforco.org">
				<Image alt="logo" src="/rael-logo.svg" height={40} width={40} />
				<span className="font-semibold sm:text-lg">CS4CO</span>
			</a>
			<div className="text-muted-foreground sm:text-lg">/</div>
			<div className="text-muted-foreground sm:text-lg">OCW Project</div>
		</div>
		<div className="hidden md:block">
			<LinkTabs orientation="horizontal">
				<LinkTabsList variant="underline">
					<LinkTabsTab href="/">Home</LinkTabsTab>
					<LinkTabsTab href="/analytics">Analytics</LinkTabsTab>
				</LinkTabsList>
			</LinkTabs>
		</div>
	</div>
);
