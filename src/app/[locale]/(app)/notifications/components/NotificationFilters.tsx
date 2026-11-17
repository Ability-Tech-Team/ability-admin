"use client";

import { useTranslations } from "next-intl";
import FilterDropdown from "@/src/components/FilterDropdown";

type Props = {
  onTypeChange?: (selected: Set<string>) => void;
};

export default function NotificationFilters({ onTypeChange }: Props) {
  const t = useTranslations("Notifications");

  return (
    <FilterDropdown
      label={t("filters.type")}
      options={[
        { value: "announcement", label: t("types.announcement") },
        { value: "push", label: t("types.push") },
      ]}
      onChange={onTypeChange}
    />
  );
}
