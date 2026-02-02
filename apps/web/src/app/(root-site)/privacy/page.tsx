import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | OCW Project",
  description:
    "OCWProject Privacy Policy - Learn how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <main className="divide-y">
      {/* Header */}
      <div className="sm:grid sm:grid-cols-12 sm:divide-x">
        <div />
        <div className="col-span-10 px-4 py-12 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Effective Date: February 1, 2026
            </p>
          </div>
        </div>
        <div className="border-r-0" />
      </div>

      {/* Content */}
      <div className="sm:grid sm:grid-cols-12 sm:divide-x">
        <div />
        <div className="col-span-10 px-4 py-8 sm:px-8">
          <div className="prose prose-slate mx-auto max-w-3xl">
            <p className="text-muted-foreground leading-relaxed">
              OCWProject ("we", "our", or "the Service") is an educational
              content distribution platform operating across multiple
              school‑specific subdomains. This Privacy Policy describes how we
              collect, use, disclose, and safeguard information in connection
              with your use of the Service.
            </p>

            <h2>1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information in the following ways:
            </p>
            <ul className="text-muted-foreground">
              <li>
                <strong>Google OAuth Account Information:</strong> When you sign
                in using Google OAuth, we receive basic account information such
                as your name, email address, and profile photo.
              </li>
              <li>
                <strong>Google Drive Import Data:</strong> If you choose to
                import files from Google Drive, we access file metadata and
                content only for the specific files you explicitly select for
                upload.
              </li>
              <li>
                <strong>User‑Submitted Content:</strong> Content you voluntarily
                upload to OCWProject, including academic notes and educational
                materials.
              </li>
            </ul>
            <p className="text-muted-foreground">
              We do not access, scan, or monitor your entire Google Drive, and
              no background or continuous Drive access occurs.
            </p>

            <h2>2. How We Use Information</h2>
            <p className="text-muted-foreground">
              Information obtained through Google OAuth and Google APIs is used
              strictly to:
            </p>
            <ul className="text-muted-foreground">
              <li>Authenticate users and manage accounts</li>
              <li>Enforce user roles and permissions</li>
              <li>
                Enable approved writers to import and upload content they select
              </li>
              <li>Operate and provide the core functionality of the Service</li>
            </ul>
            <p className="text-muted-foreground">
              Google user data is not used for advertising, marketing,
              behavioral profiling, or personalized ad targeting.
            </p>

            <h2>3. Uploaded Content vs. Google User Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              Information obtained via Google OAuth or Google Drive APIs remains
              classified as Google user data and is subject to Google’s Limited
              Use requirements until a user takes an affirmative action to
              upload content to the Service.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Once a user explicitly selects and uploads content to OCWProject,
              that content becomes platform‑hosted user‑submitted content and is
              no longer treated as Google API data.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              OCWProject may use uploaded user‑submitted content in accordance
              with its Terms of Service, including for operating, maintaining,
              improving, researching, and developing the Service, as well as for
              the development and training of machine learning or artificial
              intelligence models. Google OAuth and Google Drive API data itself
              is not used for these purposes.
            </p>

            <h2>4. Google OAuth & Drive API Access Justification</h2>
            <p className="text-muted-foreground">
              OCWProject uses Google OAuth to provide secure authentication and
              limited Google Drive read‑only access to allow approved writers to
              import files they already control.
            </p>
            <ul className="text-muted-foreground">
              <li>
                Access is limited to files explicitly selected by the user
              </li>
              <li>
                No write, delete, or organizational permissions are requested
              </li>
              <li>No automated or background Drive access occurs</li>
            </ul>
            <p className="text-muted-foreground">
              OCWProject does not modify, delete, or manage user files within
              Google Drive.
            </p>

            <h2>5. Google API Services User Data Policy Compliance</h2>
            <p className="text-muted-foreground">
              OCWProject’s use and transfer of information received from Google
              APIs complies with the Google API Services User Data Policy,
              including the Limited Use requirements. Specifically:
            </p>
            <ul className="text-muted-foreground">
              <li>
                Google user data is used only to provide user‑requested
                functionality
              </li>
              <li>Google user data is not sold</li>
              <li>
                Google user data is not shared with third parties except as
                necessary to operate the Service or comply with law
              </li>
              <li>
                Google user data is not used for advertising or AI model
                training
              </li>
            </ul>

            <h2>6. User Roles and Access Controls</h2>
            <ul className="text-muted-foreground">
              <li>Only vetted and approved writers may upload content</li>
              <li>General users may view content only</li>
              <li>Access controls are enforced at the application level</li>
            </ul>

            <h2>7. Data Storage and Security</h2>
            <p className="text-muted-foreground">
              We implement reasonable administrative, technical, and physical
              safeguards designed to protect information against unauthorized
              access, disclosure, alteration, or destruction. However, no method
              of transmission or storage is completely secure.
            </p>

            <h2>8. Data Retention and Deletion</h2>
            <ul className="text-muted-foreground">
              <li>
                Users may delete uploaded content through the Service where
                functionality is provided
              </li>
              <li>
                Users may revoke Google OAuth access at any time via their
                Google Account settings
              </li>
              <li>
                After OAuth revocation, OCWProject no longer accesses Google
                user data
              </li>
              <li>
                Certain information may be retained as required by law, security
                needs, or legitimate business purposes
              </li>
            </ul>

            <h2>9. Subdomains</h2>
            <p className="text-muted-foreground">
              This Privacy Policy applies to all OCWProject‑operated subdomains
              unless otherwise stated.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. Changes
              become effective when posted with a revised effective date.
            </p>

            <h2>11. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions or concerns regarding this Privacy Policy, contact:
            </p>
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
