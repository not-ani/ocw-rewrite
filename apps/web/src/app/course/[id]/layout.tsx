import EditButton from "@/components/edit-button";
import React, { Suspense } from "react";

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  return (
    <div>
      {children}
      <Suspense>
        <EditButton params={params} />
      </Suspense>
    </div>
  );
}
