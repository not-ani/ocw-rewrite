import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | OCW Project",
  description:
    "OCWProject Terms of Service - Read our terms and conditions for using the platform.",
};

export default function TermsPage() {
  return (
    <main className="divide-y">
      {/* Header */}
      <div className="sm:grid sm:grid-cols-12 sm:divide-x">
        <div />
        <div className="col-span-10 px-4 py-12 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Terms of Service
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
          <div className="mx-auto max-w-3xl">
            <p className="mb-6 text-muted-foreground leading-relaxed">
              Welcome to OCWProject. These Terms of Service ("Terms") govern
              your access to and use of the OCWProject platform, including all
              associated subdomains and services (the "Service"). By accessing
              or using the Service, you agree to be bound by these Terms.
            </p>

            {/* Section 1 */}
            <h2 className="mb-4 mt-8 text-xl font-semibold">
              1. Description of the Service
            </h2>
            <p className="mb-6 text-muted-foreground leading-relaxed">
              OCWProject is an educational content distribution platform that
              enables approved contributors ("Writers") to upload and share
              academic notes and educational materials within participating
              school communities.
            </p>

            {/* Section 2 */}
            <h2 className="mb-4 mt-8 text-xl font-semibold">
              2. Eligibility and Accounts
            </h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Users authenticate using Google OAuth.</li>
              <li>
                Upload privileges are restricted to vetted and approved Writers.
              </li>
              <li>
                You are responsible for maintaining the confidentiality and
                security of your account and credentials.
              </li>
            </ul>

            {/* Section 3 */}
            <h2 className="mb-4 mt-8 text-xl font-semibold">
              3. User Content and Ownership
            </h2>
            <ul className="mb-6 list-disc space-y-3 pl-6 text-muted-foreground">
              <li>
                <strong>User Content</strong> refers to materials voluntarily
                uploaded or submitted by Writers, including notes, documents,
                and educational materials, and does not include information
                obtained through Google OAuth or Google APIs.
              </li>
              <li>
                By uploading User Content to OCWProject, you irrevocably assign
                and transfer all right, title, and interest in such User Content
                to OCWProject, including all intellectual property rights, to
                the fullest extent permitted by applicable law.
              </li>
              <li>
                Where ownership transfer is not legally permitted, you grant
                OCWProject a perpetual, worldwide, exclusive, royalty‑free,
                sublicensable license to use, reproduce, modify, distribute,
                display, publish, perform, create derivative works from, and
                otherwise exploit User Content for any purpose related to
                operating, maintaining, improving, researching, analyzing, and
                developing OCWProject services, including the training of
                machine learning or artificial intelligence models using User
                Content only.
              </li>
              <li>
                OCWProject has no obligation to attribute authorship, maintain
                confidentiality, or provide compensation for User Content.
              </li>
              <li>
                You are solely responsible for User Content and represent and
                warrant that you have all required rights, permissions, and
                authority to submit such content.
              </li>
              <li>
                OCWProject expressly disclaims all liability arising from or
                related to User Content, including claims of infringement,
                misuse, or illegality.
              </li>
            </ul>

            {/* Section 4 */}
            <h2 className="mb-4 mt-8 text-xl font-semibold">
              4. Prohibited Conduct
            </h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                Uploading content that you do not own or lack authorization to
                share
              </li>
              <li>
                Uploading content that is unlawful, misleading, harmful, or
                malicious
              </li>
              <li>
                Attempting to gain unauthorized access to the Service or other
                user accounts
              </li>
              <li>
                Misusing Google OAuth or Google APIs, or accessing data without
                consent
              </li>
            </ul>

            {/* Section 5 */}
            <h2 className="mb-4 mt-8 text-xl font-semibold">
              5. Content Moderation and Removal
            </h2>
            <p className="mb-6 text-muted-foreground leading-relaxed">
              OCWProject reserves the right, but not the obligation, to review,
              monitor, restrict, or remove any content at its sole discretion,
              with or without notice, for any reason, including compliance with
              these Terms or applicable law.
            </p>

            {/* Section 6 */}
            <h2 className="mb-4 mt-8 text-xl font-semibold">6. Termination</h2>
            <p className="mb-6 text-muted-foreground leading-relaxed">
              OCWProject may suspend or terminate your access to the Service at
              any time for violations of these Terms, applicable law, or
              platform policies, or for any reason necessary to protect the
              Service.
            </p>

            {/* Section 7 */}
            <h2 className="mb-4 mt-8 text-xl font-semibold">
              7. Google OAuth and API Data Usage
            </h2>
            <p className="mb-6 text-muted-foreground leading-relaxed">
              OCWProject’s use and transfer of information received from Google
              APIs complies with the Google API Services User Data Policy,
              including the Limited Use requirements. Information obtained
              through Google OAuth or Google APIs is used solely to authenticate
              users, manage accounts, and operate core Service functionality.
              OCWProject does not sell Google user data and does not use Google
              OAuth or Google API data for advertising or for training machine
              learning or artificial intelligence models.
            </p>

            {/* Section 8 */}
            <h2 className="mb-4 mt-8 text-xl font-semibold">
              8. Disclaimer of Warranties
            </h2>
            <p className="mb-6 text-muted-foreground leading-relaxed">
              The Service is provided on an "as is" and "as available" basis
              without warranties of any kind, whether express, implied, or
              statutory.
            </p>

            {/* Section 9 */}
            <h2 className="mb-4 mt-8 text-xl font-semibold">
              9. Limitation of Liability
            </h2>
            <p className="mb-6 text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, OCWProject shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages arising out of or related to your use of the
              Service.
            </p>

            {/* Section 10 */}
            <h2 className="mb-4 mt-8 text-xl font-semibold">
              10. Changes to These Terms
            </h2>
            <p className="mb-6 text-muted-foreground leading-relaxed">
              OCWProject may modify these Terms at any time. Continued use of
              the Service after changes become effective constitutes acceptance
              of the updated Terms.
            </p>

            {/* Section 11 */}
            <h2 className="mb-4 mt-8 text-xl font-semibold">
              11. Contact Information
            </h2>
            <p className="mb-2 text-muted-foreground">
              For questions regarding these Terms, contact:
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
