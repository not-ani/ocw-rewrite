import { useMemo } from "react";
import { Button } from "@/components/ui/button";

type Props = {
	currentPage: number;
	totalPages: number;
	onPageChange: (p: number) => void;
	maxVisible?: number;
};

export function Pagination({
	currentPage,
	totalPages,
	onPageChange,
	maxVisible = 5,
}: Props) {
	const pages = useMemo<(number | "ellipsis")[]>(() => {
		const arr: (number | "ellipsis")[] = [];
		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) {
				arr.push(i);
			}
			return arr;
		}

		let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
		const end = Math.min(totalPages, start + maxVisible - 1);

		if (end - start + 1 < maxVisible) {
			start = Math.max(1, end - maxVisible + 1);
		}

		if (start > 1) {
			arr.push(1);
			if (start > 2) {
				arr.push("ellipsis");
			}
		}

		for (let i = start; i <= end; i++) {
			arr.push(i);
		}

		if (end < totalPages) {
			if (end < totalPages - 1) {
				arr.push("ellipsis");
			}
			arr.push(totalPages);
		}

		return arr;
	}, [currentPage, totalPages, maxVisible]);

	const isPrevDisabled = currentPage === 1;
	const isNextDisabled = currentPage === totalPages;

	return (
		<div className="flex flex-col items-center space-y-4">
			<div className="flex items-center space-x-2">
				<Button
					className={"h-10 w-20 rounded-l-md px-3 py-2 font-medium text-sm"}
					variant={"outline"}
					onClick={() => onPageChange(currentPage - 1)}
					disabled={isPrevDisabled}
				>
					Previous
				</Button>

				{pages.map((p) =>
					p === "ellipsis" ? (
						<span
							aria-hidden
							className="border border-gray-300 bg-background px-3 py-2 font-medium text-gray-500 text-sm"
							key={`el-${p}`}
						>
							...
						</span>
					) : (
						<Button
							aria-current={p === currentPage ? "page" : undefined}
							aria-label={`Go to page ${p}`}
							className={`border px-3 py-2 font-medium text-sm ${
								p === currentPage
									? "border-blue-500 bg-blue-50 text-blue-600"
									: "border-gray-300 bg-background text-gray-500 hover:bg-gray-50 hover:text-gray-700"
							}`}
							key={p}
							onClick={() => onPageChange(p)}
						>
							{p}
						</Button>
					),
				)}

				<Button
					className="h-10 w-20 rounded-r-md px-3 py-2 font-medium text-sm"
					onClick={() => onPageChange(currentPage + 1)}
					variant={"outline"}
					disabled={isNextDisabled}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
