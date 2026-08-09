import {
	getContactMetadata,
	renderContactPage,
} from "@/app/(marketing)/contact/page";

type Props = { params: Promise<{ domain: string }> };

export async function generateMetadata({ params }: Props) {
	return getContactMetadata((await params).domain);
}

export default async function Page({ params }: Props) {
	return renderContactPage((await params).domain);
}
