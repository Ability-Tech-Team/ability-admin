"use client";

import { useTranslations } from "next-intl";
import FilterDropdown from "@/src/components/FilterDropdown";

type Props = {
  projectOptions: { value: string; label: string }[];
  /** The project list couldn't load. */
  projectsUnavailable?: boolean;
  onProjectChange?: (selected: Set<string>) => void;
};

export default function EventFilters({ projectOptions, projectsUnavailable, onProjectChange }: Props) {
  const t = useTranslations("EventsContent");
  const tUnits = useTranslations("UnitsScreen");

  return (
    <FilterDropdown
      label={t("filters.projects")}
      options={projectOptions}
      onChange={onProjectChange}
      disabled={projectsUnavailable}
      title={projectsUnavailable ? tUnits("projectsUnavailable") : undefined}
    />
  );
}
