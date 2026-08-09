import {
	getContributeMetadata,
	renderContributePage,
} from "@/app/(marketing)/contribute/page";

type Props = { params: Promise<{ domain: string }> };

export async function generateMetadata({ params }: Props) {
	return getContributeMetadata((await params).domain);
}

export default async function Page({ params }: Props) {
	return renderContributePage((await params).domain);
}
