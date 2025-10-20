import { Header } from "@/components/header";
import { UnitPageSkeleton } from "./client";

export default async function Loading() {
  return (
    <div>
      <Header />
      <UnitPageSkeleton />
    </div>
  );
}
