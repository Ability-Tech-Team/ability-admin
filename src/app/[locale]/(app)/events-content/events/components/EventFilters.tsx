"use client";

import { useTranslations } from "next-intl";
import FilterDropdown from "@/src/components/FilterDropdown";

type Props = {
  projectOptions: { value: string; label: string }[];
  onProjectChange?: (selected: Set<string>) => void;
};

export default function EventFilters({ projectOptions, onProjectChange }: Props) {
  const t = useTranslations("EventsContent");

  return (
    <FilterDropdown
      label={t("filters.projects")}
      options={projectOptions}
      onChange={onProjectChange}
    />
  );
}
