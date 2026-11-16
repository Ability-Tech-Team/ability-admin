"use client";

import { useTranslations } from "next-intl";
import FilterDropdown from "@/src/components/FilterDropdown";

export default function ComplaintFilters() {
  const t = useTranslations("Operations");

  return (
    <FilterDropdown
      label={t("filters.priority")}
      options={[
        { value: "low", label: t("complaint.priorities.low") },
        { value: "medium", label: t("complaint.priorities.medium") },
        { value: "high", label: t("complaint.priorities.high") },
      ]}
    />
  );
}
