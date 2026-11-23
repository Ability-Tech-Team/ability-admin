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
  onOccupancyChange?: (selected: Set<string>) => void;
};

export default function AssignmentFilters({ projects, projectId, onProjectChange, onOccupancyChange }: Props) {
  const t = useTranslations("MasterData");
  const tScreen = useTranslations("UnitAssignmentScreen");

  return (
    <>
      {/* The API filters by one project at a time. */}
      <ProjectFilter
        label={t("filters.projects")}
        allLabel={tScreen("allProjects")}
        projects={projects}
        value={projectId}
        onChange={onProjectChange}
      />
      {/* `ownerShipTypeEnums`: 1 owner, 2 renter. */}
      <FilterDropdown
        label={t("filters.occupancyType")}
        options={[
          { value: "owner", label: t("customerTypes.owner") },
          { value: "tenant", label: t("customerTypes.tenant") },
        ]}
        onChange={onOccupancyChange}
      />
    </>
  );
}
