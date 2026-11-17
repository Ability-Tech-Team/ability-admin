"use client";

import { useTranslations } from "next-intl";
import FilterDropdown from "@/src/components/FilterDropdown";

type Props = {
  onProjectChange?: (selected: Set<string>) => void;
  onSourceChange?: (selected: Set<string>) => void;
};

export default function RentalFilters({ onProjectChange, onSourceChange }: Props) {
  const t = useTranslations("MasterData");

  return (
    <>
      <FilterDropdown
        label={t("filters.projects")}
        options={[
          { value: "marina-heights", label: "Marina Heights" },
          { value: "palm-residences", label: "Palm Residences" },
          { value: "corniche-gardens", label: "Corniche Gardens" },
          { value: "downtown-towers", label: "Downtown Towers" },
          { value: "business-bay", label: "Business Bay Complex" },
        ]}
        onChange={onProjectChange}
      />
      <FilterDropdown
        label={t("filters.source")}
        options={[
          { value: "app", label: t("sources.app") },
          { value: "admin", label: t("sources.admin") },
        ]}
        onChange={onSourceChange}
      />
    </>
  );
}

export function PrintRCButton() {
  const t = useTranslations("MasterData");

  return (
    <button
      type="button"
      className="flex items-center gap-1 rounded-md border border-blue-500 bg-white px-2.5 h-7 text-[10.5px] font-medium text-blue-600 hover:bg-blue-50 transition-colors"
    >
      {t("rentalColumns.printRC")}
    </button>
  );
}
