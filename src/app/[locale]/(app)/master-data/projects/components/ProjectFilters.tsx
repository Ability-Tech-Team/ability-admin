"use client";

import { useTranslations } from "next-intl";
import FilterDropdown from "@/src/components/FilterDropdown";

type Props = {
  onTypeChange?: (selected: Set<string>) => void;
};

export default function ProjectFilters({ onTypeChange }: Props) {
  const t = useTranslations("MasterData");

  return (
    <FilterDropdown
      label={t("filters.type")}
      options={[
        { value: "residential", label: t("types.residential") },
        { value: "commercial", label: t("types.commercial") },
        { value: "mixed-use", label: t("types.mixed-use") },
      ]}
      onChange={onTypeChange}
    />
  );
}
