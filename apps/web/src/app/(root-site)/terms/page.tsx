import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | OCW Project",
  description:
    "OCWProject Terms of Service - Read our terms and conditions for using the platform.",
};

export default function TermsPage() {
  return (
    <main className="divide-y">
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

      <div className="sm:grid sm:grid-cols-12 sm:divide-x">
        <div />
        <div className="col-span-10 px-4 py-8 sm:px-8">
          <div className="prose prose-slate mx-auto max-w-3xl">
            <p className="text-muted-foreground">
              Welcome to OCWProject. These Terms of Service ("Terms") govern
              your access to and use of the OCWProject platform (the "Service").
              By using the Service, you agree to these Terms.
            </p>

            <h2>1. Description of the Service</h2>
            <p className="text-muted-foreground">
              OCWProject is an educational content distribution platform for
              sharing academic materials within school communities.
            </p>

            <h2>2. Eligibility and Accounts</h2>
            <ul className="text-muted-foreground">
              <li>Users authenticate using Google OAuth.</li>
              <li>Upload privileges are restricted to approved Writers.</li>
              <li>You are responsible for safeguarding your account.</li>
            </ul>

            <h2>3. User Content and Ownership</h2>
            <ul className="text-muted-foreground">
              <li>
                User Content refers solely to materials voluntarily uploaded to
                the Service and does not include Google OAuth or API data.
              </li>
              <li>
                You assign all rights in User Content to OCWProject, to the
                fullest extent permitted by law.
              </li>
              <li>
                Where assignment is not permitted, you grant OCWProject an
                exclusive, perpetual license to use User Content, including for
                service improvement and machine learning, excluding Google OAuth
                data.
              </li>
              <li>
                You are solely responsible for User Content and its legality.
              </li>
              <li>OCWProject disclaims liability arising from User Content.</li>
            </ul>

            <h2>4. Prohibited Conduct</h2>
            <ul className="text-muted-foreground">
              <li>Uploading content without rights or authorization</li>
              <li>Submitting harmful or deceptive materials</li>
              <li>Unauthorized system access</li>
            </ul>

            <h2>5. Content Moderation</h2>
            <p className="text-muted-foreground">
              OCWProject may remove content at its discretion.
            </p>

            <h2>6. Termination</h2>
            <p className="text-muted-foreground">
              Access may be suspended or terminated for violations.
            </p>

            <h2>7. Google OAuth and API Data Usage</h2>
            <p className="text-muted-foreground">
              OCWProject’s use and transfer of information received from Google
              APIs complies with the Google API Services User Data Policy,
              including the Limited Use requirements. Google OAuth data is used
              solely to authenticate users and operate the Service. OCWProject
              does not sell Google user data and does not use Google OAuth data
              for advertising or for training machine learning or artificial
              intelligence models.
            </p>

            <h2>8. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">
              The Service is provided "as is" without warranties.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              OCWProject is not liable for indirect or consequential damages.
            </p>

            <h2>10. Changes to These Terms</h2>
            <p className="text-muted-foreground">
              Continued use constitutes acceptance of updates.
            </p>

            <h2>11. Contact</h2>
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
