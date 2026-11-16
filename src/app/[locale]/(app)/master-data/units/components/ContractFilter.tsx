"use client";

import { useTranslations } from "next-intl";
import { FilterIcon } from "@/src/components/icons/ToolbarIcons";

export default function ContractFilter() {
  const t = useTranslations("MasterData");

  return (
    <button
      type="button"
      className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 h-7 text-[10.5px] text-gray-600 hover:bg-gray-50 transition-colors"
    >
      <FilterIcon className="h-2.5 w-2.5 text-gray-400" />
      {t("contract")}
      <ChevronDownIcon className="h-2.5 w-2.5 text-gray-400" />
    </button>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}
