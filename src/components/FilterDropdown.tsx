"use client";

import { useState, useRef, useEffect } from "react";
import { FilterIcon, ChevronDownIcon } from "@/src/components/icons/ToolbarIcons";

type Props = {
  label: string;
  options: { value: string; label: string }[];
  onChange?: (selected: Set<string>) => void;
};

export default function FilterDropdown({ label, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(value: string) {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setSelected(next);
    onChange?.(next);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 h-7 text-[10.5px] text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <FilterIcon className="h-2.5 w-2.5 text-gray-400" />
        {label}
        {selected.size > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-semibold text-white">
            {selected.size}
          </span>
        )}
        <ChevronDownIcon className="h-2.5 w-2.5 text-gray-400" />
      </button>

      {open && (
        <div className="absolute top-full mt-1 z-20 min-w-[160px] rounded-lg border border-gray-200 bg-white py-2 shadow-lg start-0">
          <p className="px-3 pb-2 text-[11px] font-semibold text-gray-900">{label}</p>
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.has(opt.value)}
                onChange={() => toggle(opt.value)}
                className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
