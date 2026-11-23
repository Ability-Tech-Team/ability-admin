"use client";

import { FilterIcon } from "@/src/components/icons/ToolbarIcons";

type Props = {
  /** The filter's name, shown as its label and its "any" option. */
  label: string;
  /** The "any value" option's text. */
  allLabel: string;
  value: number | null;
  options: { value: number; label: string }[];
  onChange: (value: number | null) => void;
  disabled?: boolean;
  title?: string;
};

/** A one-value filter (the API takes one id per filter), styled like the toolbar's filters. */
export default function SelectFilter({ label, allLabel, value, options, onChange, disabled, title }: Props) {
  return (
    <label
      title={title}
      className="flex h-7 items-center gap-1 rounded-md border border-gray-200 bg-white ps-2 text-[10.5px] text-gray-600 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400"
    >
      <FilterIcon className="h-2.5 w-2.5 text-gray-400" />
      <span className="sr-only">{label}</span>
      <select
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
        className="h-full max-w-[180px] cursor-pointer rounded-md bg-transparent pe-1 text-[10.5px] text-gray-600 outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
