"use client";

import { useTranslations } from "next-intl";
import FilterDropdown from "@/src/components/FilterDropdown";
import type { Named } from "@/src/services/customers";

type Props = {
  /** The projects to filter by; null hides the filter (e.g. while they load). */
  projects: Named[] | null;
  onProjectChange?: (selected: Set<string>) => void;
};

/** The API filters requests by project; it has no relationship filter (the app sends free text). */
export default function FamilyMemberFilters({ projects, onProjectChange }: Props) {
  const t = useTranslations("MasterData");

  if (!projects || projects.length === 0) return null;
  return (
    <FilterDropdown
      label={t("filters.projects")}
      options={projects.map((project) => ({ value: String(project.id), label: project.name ?? `#${project.id}` }))}
      onChange={onProjectChange}
    />
  );
}
