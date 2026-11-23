"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FilterIcon, ChevronDownIcon } from "@/src/components/icons/ToolbarIcons";
import type { ProjectOption } from "@/src/services/projects";

type Props = {
  label: string;
  /** The first option, which clears the filter. */
  allLabel: string;
  projects: ProjectOption[];
  value: number | undefined;
  onChange: (projectId: number | undefined) => void;
};

/**
 * A one-choice version of `FilterDropdown`, with the same look, for the project filter (the API
 * filters by one project at a time). Shared by the master-data screens.
 */
export default function ProjectFilter({ label, allLabel, projects, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const name = useId();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const options: { id: number | undefined; name: string }[] = [
    { id: undefined, name: allLabel },
    ...projects.map((project) => ({ id: project.id, name: project.name })),
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 h-7 text-[10.5px] text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <FilterIcon className="h-2.5 w-2.5 text-gray-400" />
        {label}
        {value !== undefined && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-semibold text-white">
            1
          </span>
        )}
        <ChevronDownIcon className="h-2.5 w-2.5 text-gray-400" />
      </button>

      {open && (
        <div
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          className="absolute top-full mt-1 z-20 max-h-72 min-w-[180px] overflow-y-auto rounded-lg border border-gray-200 bg-white py-2 shadow-lg start-0"
        >
          <p className="px-3 pb-2 text-[11px] font-semibold text-gray-900">{label}</p>
          {options.map((option) => (
            <label
              key={option.id ?? "all"}
              className="flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name={name}
                checked={value === option.id}
                onChange={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
                className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {option.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
