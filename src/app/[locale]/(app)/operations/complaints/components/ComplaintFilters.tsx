"use client";

import { useTranslations } from "next-intl";
import FilterDropdown from "@/src/components/FilterDropdown";

type Props = {
  onPriorityChange?: (selected: Set<string>) => void;
};

export default function ComplaintFilters({ onPriorityChange }: Props) {
  const t = useTranslations("Operations");

  return (
    <FilterDropdown
      label={t("filters.priority")}
      options={[
        { value: "low", label: t("complaint.priorities.low") },
        { value: "medium", label: t("complaint.priorities.medium") },
        { value: "high", label: t("complaint.priorities.high") },
      ]}
      onChange={onPriorityChange}
    />
  );
}
