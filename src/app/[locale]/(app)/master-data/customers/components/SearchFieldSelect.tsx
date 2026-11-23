"use client";

type Props<T extends string> = {
  /** The accessible name, e.g. "Search by". */
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

/**
 * Which field the search box looks in, for routes that search one field at a time. It sits
 * before the search box (the toolbar's `leadingContent`).
 */
export default function SearchFieldSelect<T extends string>({ label, value, options, onChange }: Props<T>) {
  return (
    <select
      aria-label={label}
      title={label}
      value={value}
      onChange={(e) => {
        const next = options.find((option) => option.value === e.target.value);
        if (next) onChange(next.value);
      }}
      className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-[10.5px] text-gray-600 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}
