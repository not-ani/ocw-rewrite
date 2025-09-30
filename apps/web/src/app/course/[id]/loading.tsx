import { Header } from "@/components/header";
import { CoursePageSkeleton } from "./client";


export default async function Loading() {
  return (
    <div>
      <Header />
      <CoursePageSkeleton />

    </div>
  )
}
