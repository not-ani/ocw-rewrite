"use client";
import { FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { QRCode } from "@/components/ui/kibo-ui/qr-code";
import { useSite } from "@/lib/multi-tenant/context";

export default function RouteComponent() {
	const { siteConfig } = useSite();

	const writeForm = {
		title: "Write for OCW",
		description:
			"Share your knowledge and expertise by contributing written content to our open courseware platform.",
		url: siteConfig?.siteContributeLink,
		icon: <FileEdit className="h-8 w-8 text-primary" />,
	};

	return (
		<div>
			<main className="container mx-auto px-4 py-12">
				<div className="space-y-6">
					<div className="space-y-2 text-center">
						<h1 className="font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl">
							Contribute to {siteConfig?.schoolName} OpenCourseWare
						</h1>
						<p className="mx-auto max-w-2xl text-muted-foreground">
							Join our community and help us improve {siteConfig?.schoolName}{" "}
							OpenCourseWare{" "}
						</p>
					</div>

					<section className="py-8">
						<h2 className="mb-6 font-bold text-2xl">Contribution Forms</h2>
						<div className="">
							<Card className="flex h-full flex-col">
								<CardHeader>
									<div className="flex items-center gap-3">
										{writeForm.icon}
										<CardTitle>{writeForm.title}</CardTitle>
									</div>
									<CardDescription>{writeForm.description}</CardDescription>
								</CardHeader>
								<CardContent className="grow">
									<div className="flex justify-center">
										<QRCode
											foreground="#111"
											background="#eee"
											className="size-80 rounded border bg-white p-4 shadow-xs"
											data={writeForm.url ?? ""}
										/>
									</div>
								</CardContent>
								<CardFooter>
									<Button asChild className="w-full">
										<a
											href={writeForm.url}
											rel="noopener noreferrer"
											target="_blank"
										>
											Open Form
										</a>
									</Button>
								</CardFooter>
							</Card>
						</div>
					</section>

					<section className="py-8">
						<h2 className="mb-6 font-bold text-2xl">Why Contribute?</h2>
						<div className="grid gap-6 md:grid-cols-2">
							<Card>
								<CardHeader>
									<CardTitle>Make an Impact</CardTitle>
								</CardHeader>
								<CardContent>
									<p>
										Your contributions help make education more accessible to
										people around the world. By sharing your knowledge and
										skills, you&apos;re helping to create a valuable resource
										for learners everywhere.
									</p>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Join Our Community</CardTitle>
								</CardHeader>
								<CardContent>
									<p>
										Become part of a passionate community of educators,
										designers, and developers working together to improve open
										education. Connect with like-minded individuals and expand
										your professional network.
									</p>
								</CardContent>
							</Card>
						</div>
					</section>
				</div>
			</main>
		</div>
	);
}
