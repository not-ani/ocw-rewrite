/** biome-ignore-all lint/suspicious/noArrayIndexKey: "required" */

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import Link from "next/link";

const COLUMNS = 12;
const LAST_COLUMN = COLUMNS - 1;

export const Hero = () => (
	<section>
		<div className="sm:grid sm:grid-cols-12 sm:divide-x">
			<div />
			<div className="col-span-10 space-y-4 px-4 py-16 text-center sm:border-y sm:px-8">
				<h1 className="font-semibold text-4xl leading-tight tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
					The OpenCourseWare Project
				</h1>
				<p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground md:text-2xl">
					OCW is a multi-tenant, school-agnostic platform that empowers
					educators & students to create, share, and distribute high-quality
					educational content. Built with modern web technologies, it provides a
					seamless experience for both content creators and learners.
				</p>
				<div className="mx-auto flex w-fit flex-col items-center gap-8 pt-4">
					<p className="text-muted-foreground text-sm">
						<Button className="rounded-md bg-foreground/5 text-muted-foreground px-2 py-1 tracking-tight">
							<Link href={"/analytics"}>View our analytics</Link>
						</Button>
					</p>
				</div>
			</div>
			<div className="border-r-0" />
		</div>
	</section>
);
