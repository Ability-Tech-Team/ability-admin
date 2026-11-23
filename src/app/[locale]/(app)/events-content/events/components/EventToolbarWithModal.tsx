"use client";

import { useTranslations } from "next-intl";
import Toolbar, { type ToolbarLabels } from "@/src/components/Toolbar";

type Props = {
  labels: ToolbarLabels;
  extraFilters?: React.ReactNode;
  onStatusChange?: (selected: Set<string>) => void;
  onSearch?: (query: string) => void;
  /** Opens the event form (drawn by the page). */
  onAdd: () => void;
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
};

export default function EventToolbarWithModal({
  labels,
  extraFilters,
  onStatusChange,
  onSearch,
  onAdd,
  view,
  onViewChange,
}: Props) {
  const t = useTranslations("EventsContent");

  return (
    <>
    <Toolbar
      labels={labels}
      statusOptions={[
        { value: "published", label: t("statuses.published") },
        { value: "draft", label: t("statuses.draft") },
      ]}
      extraFilters={extraFilters}
      onStatusChange={onStatusChange}
      onSearch={onSearch}
      onAdd={onAdd}
      trailingContent={
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => onViewChange("grid")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[10.5px] font-medium transition-colors ${
              view === "grid"
                ? "bg-blue-600 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={1.5}>
              <rect x="1" y="1" width="4" height="4" rx="0.5" />
              <rect x="7" y="1" width="4" height="4" rx="0.5" />
              <rect x="1" y="7" width="4" height="4" rx="0.5" />
              <rect x="7" y="7" width="4" height="4" rx="0.5" />
            </svg>
            {t("grid")}
          </button>
          <button
            type="button"
            onClick={() => onViewChange("list")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[10.5px] font-medium transition-colors ${
              view === "list"
                ? "bg-blue-600 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={1.5}>
              <line x1="1" y1="2" x2="11" y2="2" />
              <line x1="1" y1="6" x2="11" y2="6" />
              <line x1="1" y1="10" x2="11" y2="10" />
            </svg>
            {t("list")}
          </button>
        </div>
      }
    />
    </>
  );
}
