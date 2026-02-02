import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Terms of Service | OCW Project",
	description: "OCWProject Terms of Service - Read our terms and conditions for using the platform.",
};

export default function TermsPage() {
	return (
		<main className="divide-y">
			{/* Header Section */}
			<div className="sm:grid sm:grid-cols-12 sm:divide-x">
				<div />
				<div className="col-span-10 px-4 py-12 sm:px-8">
					<div className="mx-auto max-w-3xl">
						<h1 className="font-semibold text-3xl tracking-tight sm:text-4xl mb-4">
							Terms of Service
						</h1>
						<p className="text-muted-foreground">
							Effective Date: February 1, 2026
						</p>
					</div>
				</div>
				<div className="border-r-0" />
			</div>

			{/* Content Section */}
			<div className="sm:grid sm:grid-cols-12 sm:divide-x">
				<div />
				<div className="col-span-10 px-4 py-8 sm:px-8">
					<div className="mx-auto max-w-3xl prose prose-slate">
						<p className="mb-6 text-muted-foreground leading-relaxed">
							Welcome to OCWProject. These Terms of Service (&quot;Terms&quot;) govern your access to and
							use of the OCWProject platform, including all school subdomains (the &quot;Service&quot;).
							By accessing or using the Service, you agree to be bound by these Terms.
						</p>

						<h2 className="font-semibold text-xl mt-8 mb-4">1. Description of the Service</h2>
						<p className="mb-6 text-muted-foreground leading-relaxed">
							OCWProject is an education content distribution platform that enables students
							and approved contributors (&quot;Writers&quot;) to share academic notes and learning
							materials within participating school communities.
						</p>

						<h2 className="font-semibold text-xl mt-8 mb-4">2. Eligibility and Accounts</h2>
						<ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
							<li>Users must sign in using a valid Google account.</li>
							<li>Upload privileges are restricted to vetted and approved Writers.</li>
							<li>You are responsible for maintaining the security of your account.</li>
						</ul>

						<h2 className="font-semibold text-xl mt-8 mb-4">3. User Content</h2>
						<ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
							<li>Writers retain ownership of the content they upload.</li>
							<li>By uploading content, you grant OCWProject a non-exclusive, royalty-free
							license to host, display, and distribute the content on the platform.</li>
							<li>You represent that you have the right to upload and share the content and that
							it does not infringe on the rights of others.</li>
						</ul>

						<h2 className="font-semibold text-xl mt-8 mb-4">4. Prohibited Conduct</h2>
						<p className="mb-4 text-muted-foreground">Users may not:</p>
						<ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
							<li>Upload copyrighted material without proper authorization</li>
							<li>Upload malicious, deceptive, or harmful content</li>
							<li>Attempt to gain unauthorized access to the Service or other user accounts</li>
							<li>Misuse Google OAuth or attempt to access data without user consent</li>
						</ul>

						<h2 className="font-semibold text-xl mt-8 mb-4">5. Content Moderation and Removal</h2>
						<p className="mb-6 text-muted-foreground leading-relaxed">
							OCWProject reserves the right to review, restrict, or remove content that
							violates these Terms or applicable laws, with or without notice.
						</p>

						<h2 className="font-semibold text-xl mt-8 mb-4">6. Termination</h2>
						<p className="mb-6 text-muted-foreground leading-relaxed">
							We may suspend or terminate access to the Service if a user violates these
							Terms, applicable laws, or platform policies.
						</p>

						<h2 className="font-semibold text-xl mt-8 mb-4">7. Disclaimer of Warranties</h2>
						<p className="mb-6 text-muted-foreground leading-relaxed">
							The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any
							kind, express or implied.
						</p>

						<h2 className="font-semibold text-xl mt-8 mb-4">8. Limitation of Liability</h2>
						<p className="mb-6 text-muted-foreground leading-relaxed">
							To the maximum extent permitted by law, OCWProject shall not be liable for any
							indirect, incidental, or consequential damages arising from use of the Service.
						</p>

						<h2 className="font-semibold text-xl mt-8 mb-4">9. Changes to These Terms</h2>
						<p className="mb-6 text-muted-foreground leading-relaxed">
							We may update these Terms from time to time. Continued use of the Service after
							changes constitutes acceptance of the updated Terms.
						</p>

						<h2 className="font-semibold text-xl mt-8 mb-4">10. Contact Information</h2>
						<p className="mb-2 text-muted-foreground">For questions regarding these Terms, contact us at:</p>
						<p>
							<strong>Email:</strong>{" "}
							<a
								href="mailto:ocwproject.org.arming742@passmail.net"
								className="text-primary hover:underline"
							>
								ocwproject.org.arming742@passmail.net
							</a>
						</p>
					</div>
				</div>
				<div className="border-r-0" />
			</div>
		</main>
	);
}
