"use client";

import { useTranslations } from "next-intl";
import FilterDropdown from "@/src/components/FilterDropdown";

type Props = {
  projectOptions: { value: string; label: string }[];
  onProjectChange?: (selected: Set<string>) => void;
  onOccupancyChange?: (selected: Set<string>) => void;
};

export default function AssignmentFilters({ projectOptions, onProjectChange, onOccupancyChange }: Props) {
  const t = useTranslations("MasterData");

  return (
    <>
      <FilterDropdown
        label={t("filters.projects")}
        options={projectOptions}
        onChange={onProjectChange}
      />
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
