"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FilterIcon, ChevronDownIcon } from "@/src/components/icons/ToolbarIcons";

type Props = {
  label: string;
  /** The first choice, which clears the filter. */
  allLabel: string;
  options: { value: number; label: string }[];
  value: number | null;
  onChange: (value: number | null) => void;
  /** For a filter the API can't apply yet; `title` says why. */
  disabled?: boolean;
  title?: string;
};

/**
 * A one-value filter with the look of `FilterDropdown`: the invoice routes take a single
 * `invoice_status_id` and `project_id`, not a set.
 */
export default function InvoiceFilterSelect({ label, allLabel, options, value, onChange, disabled, title }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const name = useId();

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  function choose(next: number | null) {
    onChange(next);
    setOpen(false);
  }

  const choices = [{ value: null, label: allLabel }, ...options];

  return (
    <div className="relative" ref={ref} title={title}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        disabled={disabled}
        className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 h-7 text-[10.5px] text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
      >
        <FilterIcon className="h-2.5 w-2.5 text-gray-400" />
        {label}
        {value !== null && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-semibold text-white">
            1
          </span>
        )}
        <ChevronDownIcon className="h-2.5 w-2.5 text-gray-400" />
      </button>

      {open && !disabled && (
        <fieldset className="absolute top-full mt-1 z-20 max-h-72 min-w-[180px] overflow-y-auto rounded-lg border border-gray-200 bg-white py-2 shadow-lg start-0">
          <legend className="sr-only">{label}</legend>
          <p aria-hidden="true" className="px-3 pb-2 text-[11px] font-semibold text-gray-900">{label}</p>
          {choices.map((choice) => (
            <label
              key={choice.value ?? "all"}
              className="flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name={name}
                checked={value === choice.value}
                onChange={() => choose(choice.value)}
                className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {choice.label}
            </label>
          ))}
        </fieldset>
      )}
    </div>
  );
}
