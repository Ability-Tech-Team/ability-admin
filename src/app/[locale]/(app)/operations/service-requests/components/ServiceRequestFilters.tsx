"use client";

import { useTranslations } from "next-intl";
import FilterDropdown from "@/src/components/FilterDropdown";

type Props = {
  projectOptions: { value: string; label: string }[];
  onProjectChange?: (selected: Set<string>) => void;
};

export default function ServiceRequestFilters({ projectOptions, onProjectChange }: Props) {
  const t = useTranslations("Operations");

  return (
    <FilterDropdown
      label={t("filters.projects")}
      options={projectOptions}
      onChange={onProjectChange}
    />
  );
}
