"use client";

import { useState } from "react";
import {
  SearchIcon,
  ImportIcon,
} from "@/src/components/icons/ToolbarIcons";
import FilterDropdown from "@/src/components/FilterDropdown";

export type StatusOption = { value: string; label: string };

export type ToolbarLabels = {
  searchPlaceholder: string;
  exactSearch: string;
  status: string;
  export?: string;
  import?: string;
  addLabel: string;
};

type ToolbarProps = {
  labels: ToolbarLabels;
  /** Options shown inside the Status filter dropdown. */
  statusOptions?: StatusOption[];
  /** Content rendered before the search input (e.g. Print RC button). */
  leadingContent?: React.ReactNode;
  /** Extra filter buttons rendered after the Status filter. */
  extraFilters?: React.ReactNode;
  /** Content rendered before the add button on the right side. */
  trailingContent?: React.ReactNode;
  /** Hide the Status filter button entirely. */
  hideStatus?: boolean;
  onSearch?: (query: string) => void;
  /** Shows the "Exact search" checkbox; leave it out where the API can't search exactly. */
  onExactSearchChange?: (exact: boolean) => void;
  /** Called with the ticked values. Without `statusOptions` the Status filter isn't shown. */
  onStatusChange?: (selected: Set<string>) => void;
  onAdd?: () => void;
  onExport?: () => void;
  onImport?: () => void;
};

export default function Toolbar({
  labels,
  statusOptions = [],
  leadingContent,
  extraFilters,
  trailingContent,
  hideStatus,
  onSearch,
  onExactSearchChange,
  onStatusChange,
  onAdd,
  onExport,
  onImport,
}: ToolbarProps) {
  const [search, setSearch] = useState("");
  const [exactSearch, setExactSearch] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3 px-5">
      {/* Left: search + filters */}
      <div className="flex items-center gap-3">
        {leadingContent}
        <div className="relative">
          <SearchIcon className="absolute start-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              onSearch?.(e.target.value);
            }}
            placeholder={labels.searchPlaceholder}
            className="h-9 w-[280px] rounded-lg border border-gray-200 bg-white ps-7 pe-2 text-[10.5px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
          />
        </div>

        {/* Only where the screen's API route can search exactly; elsewhere it would do nothing. */}
        {onExactSearchChange && (
          <label className="flex items-center gap-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={exactSearch}
              onChange={(e) => {
                setExactSearch(e.target.checked);
                onExactSearchChange(e.target.checked);
              }}
              className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-[12px] text-gray-500">{labels.exactSearch}</span>
          </label>
        )}

        {!hideStatus && statusOptions.length > 0 && (
          <FilterDropdown label={labels.status} options={statusOptions} onChange={onStatusChange} />
        )}

        {extraFilters}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {labels.export && (
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 h-7 text-[10.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {labels.export}
          </button>
        )}
        {labels.import && (
          <button
            type="button"
            onClick={onImport}
            className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 h-7 text-[10.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ImportIcon className="h-3 w-3 text-gray-500" />
            {labels.import}
          </button>
        )}
        {trailingContent}
        {labels.addLabel && (
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1 rounded-md bg-blue-600 px-3 h-7 text-[10.5px] font-medium text-white hover:bg-blue-700 transition-colors"
          >
            {labels.addLabel}
          </button>
        )}
      </div>
    </div>
  );
}
