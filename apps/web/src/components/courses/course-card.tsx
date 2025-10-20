"use client";

import Link from "next/link";
import Image from "next/image";

export type Course = {
  _id: string;
  name: string;
  description?: string;
  unitLength?: number;
  imageUrl?: string;
};

type Props = {
  course: Course;
};

export function CourseCard({ course }: Props) {
  return (
    <div className="bg-card overflow-hidden rounded-lg shadow-md transition-shadow duration-200 hover:shadow-lg">
      {course.imageUrl ? (
        <Image
          alt={course.name}
          fill
          className="h-48 w-full object-cover"
          loading="lazy"
          src={course.imageUrl}
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-gray-100">
          <span className="text-muted-foreground">{course.name}</span>
        </div>
      )}

      <Link
        className="bg-card overflow-hidden rounded-lg shadow-md transition-shadow duration-200 hover:shadow-lg"
        href={`/course/${course._id}`}
      >
        <div className="p-4">
          <h3 className="text-foreground mb-2 line-clamp-2 text-lg font-semibold">
            {course.name}
          </h3>
          <p className="text-muted-foreground mb-3 line-clamp-3 text-sm">
            {course.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              {course.unitLength ?? 0} units
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
