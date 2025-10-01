import { Suspense } from "react";
import { CoursesPage } from "./client";

export default async function Page() {
  return (
    <Suspense>
      <CoursesPage />
    </Suspense>
  );
}
