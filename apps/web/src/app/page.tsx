"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";


export default function Page() {
  const sites = useQuery(api.site.getSites);
  return (
    <div className="container mx-auto w-full items-center h-screen flex flex-col pt-10 gap-4">
      <h1 className="text-4xl font-bold"> The OpenCourseWare Project </h1>
      <p className="text-lg"> Welcome to the OpenCourseWare Project </p>
      <div className="grid grid-cols-2 gap-4">
        {sites ? sites.map((site) => (
          <Card key={site.school} className="flex flex-col items-center justify-center">
            <CardContent> 
              <Link href={`https://${site.school}.ocwproject.org`}>
                {site.schoolName}
              </Link>
            </CardContent>
          </Card>
        )) : Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}