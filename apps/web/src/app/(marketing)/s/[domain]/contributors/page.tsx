import {
	getContributorsMetadata,
	renderContributorsPage,
} from "@/app/(marketing)/contributors/page";

type Props = { params: Promise<{ domain: string }> };

export async function generateMetadata({ params }: Props) {
	return getContributorsMetadata((await params).domain);
}

export default async function Page({ params }: Props) {
	return renderContributorsPage((await params).domain);
}
