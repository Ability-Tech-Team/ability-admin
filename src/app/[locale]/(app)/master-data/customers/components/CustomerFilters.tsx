"use client";

import { useTranslations } from "next-intl";
import FilterDropdown from "@/src/components/FilterDropdown";

type Props = {
  onProjectChange?: (selected: Set<string>) => void;
  onTypeChange?: (selected: Set<string>) => void;
};

export default function CustomerFilters({ onProjectChange, onTypeChange }: Props) {
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
        label={t("filters.type")}
        options={[
          { value: "owner", label: t("customerTypes.owner") },
          { value: "tenant", label: t("customerTypes.tenant") },
        ]}
        onChange={onTypeChange}
      />
    </>
  );
}
