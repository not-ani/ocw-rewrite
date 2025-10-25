import FooterSections from "@/components/footer";
import { Header } from "@/components/header";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div>
			<Header />
			{children}
			<footer className="border-t bg-background py-12">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 gap-12 md:grid-cols-4">
						<FooterSections />
					</div>
				</div>
			</footer>
		</div>
	);
}
