import TeachersPage, {
	getTeachersMetadata,
} from "@/app/(marketing)/teachers/page";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ domain: string }>;
}) {
	return getTeachersMetadata((await params).domain);
}

export default TeachersPage;
