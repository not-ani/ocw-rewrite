import {
	getAboutMetadata,
	renderAboutPage,
} from "@/app/(marketing)/about/page";

type Props = { params: Promise<{ domain: string }> };

export async function generateMetadata({ params }: Props) {
	return getAboutMetadata((await params).domain);
}

export default async function Page({ params }: Props) {
	return renderAboutPage((await params).domain);
}
