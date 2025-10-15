import Link from "next/link";

export default function Page() {
  return (
    <div className="container mx-auto w-full h-screen flex flex-col">
      <h1> The OpenCourseWare Project </h1>
      <p> Welcome to the OpenCourseWare Project </p>
      <Link href="https://creek.ocwproject.org">
        Your probably looking for creekocw
      </Link>
    </div>
  );
}
