"use client";

import { useTranslations } from "next-intl";
import FilterDropdown from "@/src/components/FilterDropdown";

export default function ServiceRequestFilters() {
  const t = useTranslations("Operations");

  return (
    <FilterDropdown
      label={t("filters.projects")}
      options={[
        { value: "marina-heights", label: "Marina Heights" },
        { value: "downtown-towers", label: "Downtown Towers" },
        { value: "palm-residences", label: "Palm Residences" },
        { value: "gouna", label: "Gouna" },
      ]}
    />
  );
}
