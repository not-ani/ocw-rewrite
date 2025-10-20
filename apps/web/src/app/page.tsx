"use client";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function Page() {
  const sites = useQuery(api.site.getSites);
  return (
    <div className="container mx-auto flex h-screen w-full flex-col items-center gap-4 pt-10">
      <h1 className="text-4xl font-bold"> The OpenCourseWare Project </h1>
      <p className="text-lg text-center text-muted-foreground leading-relaxed max-w-lg">
        OCW is a multi-tenant, school-agnostic platform that empowers educators to create, share, and distribute
        high-quality educational content. Built with modern web technologies, it provides a seamless experience
        for both content creators and learners.
      </p>
      <p className="text-sm text-muted-foreground">
        A project of{" "}
        <Link 
          href="https://csforco.org" 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          CS for CO
        </Link>
      </p>
      <Separator className="my-4 max-w-lg" />
      <h1 className="text-3xl font-bold">Want to add your school?</h1>
      <p className="text-lg text-center text-muted-foreground leading-relaxed max-w-lg">
        If you want to add your school to the list, please fill out this form:
        {" "}
        <Link href="https://forms.gle/6uzDkmrrAqanHqVn7" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">
          here
        </Link>.
      </p>

      <Separator className="my-4 max-w-lg" />
      <h1 className="text-3xl font-bold">Schools</h1>
      <div className="grid grid-cols-2 gap-4">
        {sites
          ? sites.map((site) => (
              <Card
                key={site.school}
                className="flex flex-col items-center justify-center"
              >
                <CardContent>
                  <Link href={`https://${site.school}.ocwproject.org`}>
                    {site.schoolName}
                  </Link>
                </CardContent>
              </Card>
            ))
          : Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
      </div>
    </div>
  );
}
