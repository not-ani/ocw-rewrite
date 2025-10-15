"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSiteContext } from "@/lib/multi-tenant/context";

export function HeroSection() {
  const { siteConfig } = useSiteContext();
  return (
    <section className="relative h-[38vh]">
      <div className="relative z-auto container mx-auto flex flex-col gap-5 px-4 text-center">
        <h2 className="text-foreground mb-8 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
          {siteConfig?.schoolName} OpenCourseWare
        </h2>
        <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Button size="lg" className="" asChild>
            <Link prefetch href="/courses">
              See All Courses
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="" asChild>
            <Link href="/about">Learn About Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
