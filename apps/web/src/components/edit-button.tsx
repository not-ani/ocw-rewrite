import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { PermissionWrapper } from "./permissions";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { extractSubdomain } from "@/lib/multi-tenant/server";
import type { Route } from "next";

function getLink(id: string, unitId?: string, lessonId?: string) {
  if (lessonId) {
    return `/course/${id}/dashboard/lesson/${lessonId}`;
  }
  if (unitId) {
    return `/course/${id}/dashboard/unit/${unitId}`;
  }
  return `/course/${id}/dashboard`;
}

export default async function EditButton({
  params,
}: {
  params: Promise<{
    id: string;
    lessonId?: string;
    unitId?: string;
  }>;
}) {
  const { lessonId, unitId, id } = await params;

  const subdomain = await extractSubdomain();
  if (!subdomain) {
    return null;
  }
  const link = getLink(id, unitId, lessonId);

  return (
    <div className="relative">
      <PermissionWrapper
        courseId={id as Id<"courses">}
        requiredRole="editor"
        school={subdomain}
      >
        <Link
          prefetch
          href={link as Route}
          className={cn(
            buttonVariants({ variant: "default", size: "icon" }),
            "fixed right-4 bottom-4 rounded-full shadow-lg transition-shadow duration-200 hover:shadow-xl",
          )}
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Link>
      </PermissionWrapper>
    </div>
  );
}
