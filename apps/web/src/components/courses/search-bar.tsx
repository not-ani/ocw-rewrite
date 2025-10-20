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
    <form
      className="max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      role="search"
    >
      <label className="sr-only" htmlFor="courses-search">
        Search courses
      </label>
      <div className="flex">
        <Input
          aria-label="Search courses"
          autoComplete="off"
          className="border-input bg-background focus:border-primary focus:ring-ring flex-1 border px-4 py-2 outline-none focus:ring-2"
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type="search"
          value={value}
        />
      </div>
    </form>
  );
}
