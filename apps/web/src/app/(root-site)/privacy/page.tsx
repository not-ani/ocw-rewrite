import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Privacy Policy | OCW Project",
	description: "OCWProject Privacy Policy - Learn how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
	return (
		<main className="divide-y">
			{/* Header Section */}
			<div className="sm:grid sm:grid-cols-12 sm:divide-x">
				<div />
				<div className="col-span-10 px-4 py-12 sm:px-8">
					<div className="mx-auto max-w-3xl">
						<h1 className="font-semibold text-3xl tracking-tight sm:text-4xl mb-4">
							Privacy Policy
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
							OCWProject (&quot;we&quot;, &quot;our&quot;, or &quot;the Service&quot;) is an education content distribution
							platform operating across multiple school-specific subdomains. This Privacy
							Policy explains how we collect, use, and protect user information.
						</p>

						<h2 className="font-semibold text-xl mt-8 mb-4">Information We Collect</h2>
						<p className="mb-4 text-muted-foreground">When users sign in using Google OAuth, we collect:</p>
						<ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
							<li>Basic account information such as name, email address, and profile photo</li>
							<li>Google Drive file metadata and content only for files explicitly selected by
							the user for upload</li>
						</ul>
						<p className="mb-6 text-muted-foreground">We do not access the user&apos;s entire Google Drive.</p>

						<h2 className="font-semibold text-xl mt-8 mb-4">How We Use Information</h2>
						<p className="mb-4 text-muted-foreground">We use collected information solely to:</p>
						<ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
							<li>Authenticate users</li>
							<li>Manage user roles and permissions</li>
							<li>Enable approved writers to upload educational materials</li>
							<li>Host and display uploaded content</li>
						</ul>
						<p className="mb-6 text-muted-foreground">We do not use user data for advertising or marketing.</p>

						<h2 className="font-semibold text-xl mt-8 mb-4">Google OAuth & Drive API Justification</h2>
						<p className="mb-4 text-muted-foreground leading-relaxed">
							OCWProject uses Google OAuth to provide secure authentication and to allow
							approved writers to import educational materials from their own Google Drive
							accounts.
						</p>
						<p className="mb-4 text-muted-foreground">Justification for Google Drive Read-Only Access:</p>
						<ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
							<li>The platform allows writers to upload notes and educational content stored in
							Google Drive.</li>
							<li>Read-only access is required so users can select existing files without
							granting write or full-drive permissions.</li>
							<li>Access is limited to files explicitly chosen by the user during the upload
							process.</li>
							<li>No background or continuous access to Google Drive occurs.</li>
						</ul>
						<p className="mb-6 text-muted-foreground">
							OCWProject does not modify, delete, or organize files in Google Drive.
						</p>

						<h2 className="font-semibold text-xl mt-8 mb-4">Google API Services User Data Policy Compliance</h2>
						<p className="mb-4 text-muted-foreground leading-relaxed">
							OCWProject&apos;s use of Google user data complies with the Google API Services User
							Data Policy, including the Limited Use requirements:
						</p>
						<ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
							<li>Data is used only to provide user-requested functionality</li>
							<li>Google user data is not sold or shared with third parties</li>
							<li>Google user data is not used for advertising purposes</li>
						</ul>

						<h2 className="font-semibold text-xl mt-8 mb-4">User Roles and Access Controls</h2>
						<ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
							<li>Only vetted and approved writers may upload content</li>
							<li>General users may view content but cannot upload</li>
							<li>Permissions are enforced at the application level</li>
						</ul>

						<h2 className="font-semibold text-xl mt-8 mb-4">Data Storage and Security</h2>
						<ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
							<li>Uploaded content is stored securely</li>
							<li>Access is limited to authorized systems and personnel</li>
							<li>Reasonable safeguards are in place to protect user data</li>
						</ul>

						<h2 className="font-semibold text-xl mt-8 mb-4">Data Retention and Deletion</h2>
						<ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
							<li>Users may delete uploaded content at any time</li>
							<li>Users may revoke OAuth access via their Google Account settings</li>
							<li>After revocation, OCWProject no longer accesses Google account or Drive data</li>
						</ul>

						<h2 className="font-semibold text-xl mt-8 mb-4">Subdomains</h2>
						<p className="mb-6 text-muted-foreground leading-relaxed">
							This Privacy Policy applies to all OCWProject school subdomains unless otherwise
							stated.
						</p>

						<h2 className="font-semibold text-xl mt-8 mb-4">Changes to This Policy</h2>
						<p className="mb-6 text-muted-foreground leading-relaxed">
							We may update this Privacy Policy periodically. Updates will be posted with a
							revised effective date.
						</p>

						<h2 className="font-semibold text-xl mt-8 mb-4">Contact Information</h2>
						<p className="mb-2 text-muted-foreground">For privacy-related questions, contact:</p>
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
