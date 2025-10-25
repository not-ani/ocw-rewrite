import { Input } from "../ui/input";

type Props = {
	value: string;
	onChange: (v: string) => void;
	onSubmit?: () => void;
	placeholder?: string;
};

export function SearchBar({
	value,
	onChange,
	onSubmit,
	placeholder = "Search courses...",
}: Props) {
	return (
		<search
			className="max-w-md"
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit?.();
			}}
		>
			<label className="sr-only" htmlFor="courses-search">
				Search courses
			</label>
			<div className="flex">
				<Input
					aria-label="Search courses"
					autoComplete="off"
					className="flex-1 border border-input bg-background px-4 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-ring"
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					type="search"
					value={value}
				/>
			</div>
		</search>
	);
}
