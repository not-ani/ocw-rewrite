import Link from "next/link";
import { Button } from "@ocw/ui/button";
import { ArrowRight, BarChart3 } from "lucide-react";

export const Hero = () => (
  <section>
    <div className="sm:grid sm:grid-cols-12 sm:divide-x">
      <div />
      <div className="col-span-10 space-y-6 px-4 py-20 text-center sm:px-8 md:py-28">
        <div className="mx-auto w-fit rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          Open Education for Everyone
        </div>
        <h1 className="font-semibold text-4xl leading-tight tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          The{" "}
          <span className="bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
            OpenCourseWare
          </span>{" "}
          Project
        </h1>
        <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
          A multi-tenant, school-agnostic platform that empowers educators &
          students to create, share, and distribute high-quality educational
          content.
        </p>
        <div className="mx-auto flex w-fit flex-wrap items-center justify-center gap-4 pt-4">
          <Button asChild size="lg">
            <Link href="/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Analytics
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <a
              href="https://github.com/not-ani/ocw-rewrite"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn More
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
      <div className="border-r-0" />
    </div>
  </section>
);
