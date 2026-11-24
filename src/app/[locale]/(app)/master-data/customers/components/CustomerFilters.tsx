"use client";

import { useTranslations } from "next-intl";
import FilterDropdown from "@/src/components/FilterDropdown";
import { OWNERSHIP_FILTER_OPTIONS } from "../schema";
import type { Named } from "../types";

type Props = {
  /** The projects to filter by; null hides the filter (e.g. while they load). */
  projects: Named[] | null;
  onProjectChange?: (selected: Set<string>) => void;
  onTypeChange?: (selected: Set<string>) => void;
};

export default function CustomerFilters({ projects, onProjectChange, onTypeChange }: Props) {
  const t = useTranslations("MasterData");

  return (
    <>
      {projects && projects.length > 0 && (
        <FilterDropdown
          label={t("filters.projects")}
          options={projects.map((project) => ({ value: String(project.id), label: project.name ?? `#${project.id}` }))}
          onChange={onProjectChange}
        />
      )}
      <FilterDropdown
        label={t("filters.type")}
        options={OWNERSHIP_FILTER_OPTIONS.map((option) => ({
          value: String(option.id),
          label: t(`customerTypes.${option.labelKey}`),
        }))}
        onChange={onTypeChange}
      />
    </>
  );
}
