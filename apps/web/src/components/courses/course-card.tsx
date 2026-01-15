"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

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

export const CourseCard = memo(function CourseCard({ course }: Props) {
	return (
		<Link
			href={`/course/${course._id}`}
			className="block overflow-hidden rounded-lg bg-card shadow-md transition-shadow duration-200 hover:shadow-lg"
		>
			{course.imageUrl ? (
				<div className="relative h-48 w-full">
					<Image
						alt={course.name}
						fill
						className="object-cover"
						loading="lazy"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						src={course.imageUrl}
					/>
				</div>
			) : (
				<div className="flex h-48 w-full items-center justify-center bg-muted">
					<span className="text-muted-foreground">{course.name}</span>
				</div>
			)}
			<div className="p-4">
				<h3 className="mb-2 line-clamp-2 font-semibold text-foreground text-lg">
					{course.name}
				</h3>
				<p className="mb-3 line-clamp-3 text-muted-foreground text-sm">
					{course.description}
				</p>
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground text-sm">
						{course.unitLength ?? 0} units
					</span>
				</div>
			</div>
		</Link>
	);
});
