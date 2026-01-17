import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@ocw/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";

const NetworkGraph = dynamic(() => import("./network-graph").then((mod) => mod.NetworkGraph), {
});

export const metadata: Metadata = {
  title: "Our Mission | The OpenCourseWare Project",
  description:
    "OCW is a school-agnostic platform empowering communities to create and share educational resources. Local-first learning for everyone.",
};

export default function MissionPage() {
  return (
    <main className="divide-y">
      {/* Hero Section */}
      <section>
        <div className="sm:grid sm:grid-cols-12 sm:divide-x">
          <div />
          <div className="col-span-10 space-y-6 px-4 py-20 text-center sm:border-y sm:px-8 md:py-28">
            <div className="mx-auto w-fit rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Our Mission
            </div>
            <h1 className="font-semibold text-4xl leading-tight tracking-tighter sm:text-5xl md:text-6xl">
              Education should be
              <br />
              <span className="text-primary">accessible for everyone</span>
            </h1>
            <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
              We&apos;re building the infrastructure that removes technical
              barriers so communities can focus on what matters most: sharing
              knowledge.
            </p>
          </div>
          <div className="border-r-0" />
        </div>
      </section>

      {/* What We Believe Section */}
      <section>
        <div className="sm:grid sm:grid-cols-12 sm:divide-x">
          <div />
          <div className="col-span-10 px-4 py-16 sm:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 text-center font-semibold text-2xl tracking-tight sm:text-3xl">
                What We Believe
              </h2>
              <div className="space-y-6 text-muted-foreground">
                <p className="text-lg leading-relaxed">
                  The best educational resources come from people who understand
                  their community. A tutor succeeds not because they have access
                  to universal knowledge, but because they understand{" "}
                  <em>their</em> student, <em>their</em> classes, <em>their</em>{" "}
                  specific challenges.
                </p>
                <p className="text-lg leading-relaxed">
                  This is why we built OCW as a{" "}
                  <strong className="text-foreground">
                    distributed platform
                  </strong>
                  . Local-first materials work best.
                </p>
              </div>
            </div>
          </div>
          <div className="border-r-0" />
        </div>
      </section>

      {/* Core Principles - Bento Grid */}
      <section>
        <div className="sm:grid sm:grid-cols-12 sm:divide-x">
          <div />
          <div className="col-span-10">
            <div className="grid divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
              {/* Row 1 */}
              <div className="flex flex-col justify-between p-6 md:p-8">
                <div>
                  <h3 className="mb-2 font-semibold text-lg tracking-tight">
                    Any School
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Platform-agnostic infrastructure that works for any
                    educational institution.
                  </p>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                {/* Visual Asset: School Buildings */}
                <div className="mt-6 flex items-end gap-2">
                  <div className="h-12 w-8 rounded-t-lg border border-border bg-muted/30" />
                  <div className="h-16 w-10 rounded-t-lg border border-border bg-muted/50" />
                  <div className="h-20 w-8 rounded-t-lg border border-primary/40 bg-primary/10" />
                  <div className="h-14 w-6 rounded-t-lg border border-border bg-muted/30" />
                  <div className="h-10 w-8 rounded-t-lg border border-border bg-muted/40" />
                </div>
              </div>

              <div className="flex flex-col justify-between p-6 md:p-8">
                <div>
                  <h3 className="mb-2 font-semibold text-lg tracking-tight">
                    Community Built
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Resources created by students, for students within each
                    community.
                  </p>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                {/* Visual Asset: Chat/Collaboration UI */}
                <div className="mt-6 space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px]">
                      <span className="text-primary">AI</span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      Thinking...
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded border border-border bg-background p-2">
                    <div className="h-1.5 flex-1 rounded-full bg-muted" />
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-primary">
                      <ArrowRight className="h-3 w-3 text-primary-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between p-6 md:p-8">
                <div>
                  <h3 className="mb-2 font-semibold text-lg tracking-tight">
                    Zero Barriers
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    No paywalls, no gatekeeping. Knowledge should be accessible.
                  </p>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                {/* Visual Asset: Feature Badges */}
                <div className="mt-6 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Free
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs">
                      Open
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs">
                      Unlimited
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted/20 px-3 py-1 text-xs">
                      Accessible
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs">
                      No Signup
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal divider */}
            <div className="border-t" />

            <div className="grid divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
              {/* Row 2 */}
              <div className="flex flex-col justify-between p-6 md:p-8">
                <div>
                  <h3 className="mb-2 font-semibold text-lg tracking-tight">
                    Open & Free
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Open-source platform, free forever. No hidden costs.
                  </p>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                {/* Visual Asset: Browser Window */}
                <div className="mt-6 overflow-hidden rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center gap-1.5 border-b border-border bg-muted/30 px-3 py-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="font-mono text-primary text-xs">
                      What will you create?
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-12 rounded border border-border bg-muted/40" />
                      <div className="h-6 w-12 rounded border border-border bg-muted/40" />
                      <div className="h-6 w-12 rounded border border-border bg-muted/40" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between p-6 md:p-8">
                <div>
                  <h3 className="mb-2 font-semibold text-lg tracking-tight">
                    Local First
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Content created by your community, for your community.
                  </p>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                {/* Visual Asset: Product Cards */}
                <div className="mt-6 flex justify-center gap-3">
                  <div className="h-16 w-12 rounded border border-border bg-linear-to-b from-muted/50 to-muted/20 p-1">
                    <div className="h-full w-full rounded-sm bg-muted/40" />
                  </div>
                  <div className="h-16 w-12 rounded border border-primary/30 bg-linear-to-b from-primary/20 to-primary/5 p-1">
                    <div className="h-full w-full rounded-sm bg-primary/20" />
                  </div>
                  <div className="h-16 w-12 rounded border border-border bg-linear-to-b from-muted/50 to-muted/20 p-1">
                    <div className="h-full w-full rounded-sm bg-muted/40" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between p-6 md:p-8">
                <div>
                  <h3 className="mb-2 font-semibold text-lg tracking-tight">
                    Less Stress
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Secure, isolated environments for worry-free learning.
                  </p>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                {/* Visual Asset: Multi-tenant Windows */}
                <div className="mt-6 space-y-1.5">
                  <div className="flex items-center gap-2 rounded border border-border bg-muted/20 px-2 py-1.5">
                    <div className="flex gap-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                    </div>
                    <span className="flex-1 text-right font-mono text-[10px] text-muted-foreground">
                      creek.ocwproject.org
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded border border-border bg-muted/20 px-2 py-1.5">
                    <div className="flex gap-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                    </div>
                    <span className="flex-1 text-right font-mono text-[10px] text-muted-foreground">
                      eaglecrest.ocwproject.org
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded border border-primary/30 bg-primary/10 px-2 py-1.5">
                    <div className="flex gap-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-400/70" />
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-400/70" />
                      <div className="h-1.5 w-1.5 rounded-full bg-green-400/70" />
                    </div>
                    <span className="flex-1 text-right font-mono text-[10px] text-primary">
                      your-school.ocwproject.org
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-r-0" />
        </div>
      </section>

      {/* The Vision Section */}
      <section>
        <div className="sm:grid sm:grid-cols-12 sm:divide-x">
          <div />
          <div className="col-span-10">
            <div className="grid md:grid-cols-2 md:divide-x">
              {/* Left side - Text content */}
              <div className="flex flex-col justify-center px-4 py-16 sm:px-8 md:py-20">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <BookOpen className="h-7 w-7 text-primary" />
                </div>
                <h2 className="mb-6 font-semibold text-2xl tracking-tight sm:text-3xl">
                  The Vision
                </h2>
                <p className="mb-6 text-lg text-muted-foreground leading-relaxed">
                  Imagine a world where every school has its own thriving
                  ecosystem of student-created resources. Where sharing
                  knowledge is as easy as uploading a file. Where communities
                  naturally form around the shared goal of helping each other
                  succeed.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  That&apos;s what we&apos;re building. Not a replacement for
                  education, but a{" "}
                  <strong className="text-foreground">multiplier</strong> for
                  it.
                </p>
              </div>

              {/* Right side - Network Graph */}
              <div className="flex items-center justify-center px-4 py-12 sm:px-8 md:py-16">
                <div className="aspect-square w-full max-w-[320px]">
                  <NetworkGraph />
                </div>
              </div>
            </div>
          </div>
          <div className="border-r-0" />
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <div className="sm:grid sm:grid-cols-12 sm:divide-x">
          <div />
          <div className="col-span-10 px-4 py-16 text-center sm:px-8">
            <h2 className="mb-4 font-semibold text-2xl tracking-tight sm:text-3xl">
              Ready to bring OCW to your school?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
              Join the growing network of schools using OCW to empower their
              communities. It&apos;s free, open, and built to scale.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link
                  href="https://forms.gle/6uzDkmrrAqanHqVn7"
                  target="_blank"
                >
                  Add Your School
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/">Explore Schools</Link>
              </Button>
            </div>
          </div>
          <div className="border-r-0" />
        </div>
      </section>
    </main>
  );
}
