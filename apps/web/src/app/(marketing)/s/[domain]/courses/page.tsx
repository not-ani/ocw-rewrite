import {
	getCoursesMetadata,
	renderCoursesPage,
} from "@/app/(marketing)/courses/page";

type Props = { params: Promise<{ domain: string }> };

export async function generateMetadata({ params }: Props) {
	return getCoursesMetadata((await params).domain);
}

export default async function Page({ params }: Props) {
	return renderCoursesPage((await params).domain);
}
