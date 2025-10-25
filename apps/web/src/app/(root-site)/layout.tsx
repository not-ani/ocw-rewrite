import { Header } from "@/components/home-page/header";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div className="container mx-auto max-w-5xl divide-y px-0 sm:border-x">
			<Header />
			{children}
			<div />
		</div>
	);
}
