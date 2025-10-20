import { Suspense } from "react";
import { CoursesPage } from "./client";
import { extractSubdomain } from "@/lib/multi-tenant/server";

export default async function Page() {
  const subdomain = await extractSubdomain();

  if (!subdomain) {
    return <div>No subdomain found</div>;
  }

  return (
    <Suspense>
      <CoursesPage subdomain={subdomain} />
    </Suspense>
  );
}
