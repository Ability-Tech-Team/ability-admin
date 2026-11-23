"use client";

import { useTranslations } from "next-intl";
import FilterDropdown from "@/src/components/FilterDropdown";
import type { ProjectOption } from "@/src/services/projects";
import ProjectFilter from "../../components/ProjectFilter";

type Props = {
  /** From the API's project list. */
  projects: ProjectOption[];
  projectId: number | undefined;
  onProjectChange: (projectId: number | undefined) => void;
};

export default function ContractFilter({ projects, projectId, onProjectChange }: Props) {
  const t = useTranslations("MasterData");
  const tUnits = useTranslations("UnitsScreen");

  return (
    <>
      <ProjectFilter
        label={t("filters.projects")}
        allLabel={tUnits("allProjects")}
        projects={projects}
        value={projectId}
        onChange={onProjectChange}
      />
      {/* Units have no contract type (annual, monthly) in the API, so this can't filter yet. */}
      <FilterDropdown
        label={t("contract")}
        options={[
          { value: "annual", label: t("contractTypes.annual") },
          { value: "monthly", label: t("contractTypes.monthly") },
        ]}
        disabled
        title={tUnits("notAvailableYet")}
      />
    </>
  );
}
