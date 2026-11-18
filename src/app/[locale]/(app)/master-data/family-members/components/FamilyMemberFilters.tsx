"use client";

import { useTranslations } from "next-intl";
import FilterDropdown from "@/src/components/FilterDropdown";

type Props = {
  projectOptions: { value: string; label: string }[];
  onProjectChange?: (selected: Set<string>) => void;
  onRelationshipChange?: (selected: Set<string>) => void;
};

export default function FamilyMemberFilters({ projectOptions, onProjectChange, onRelationshipChange }: Props) {
  const t = useTranslations("MasterData");

  return (
    <>
      <FilterDropdown
        label={t("filters.projects")}
        options={projectOptions}
        onChange={onProjectChange}
      />
      <FilterDropdown
        label={t("filters.relationship")}
        options={[
          { value: "spouse", label: t("relationships.spouse") },
          { value: "child", label: t("relationships.child") },
          { value: "parent", label: t("relationships.parent") },
          { value: "sibling", label: t("relationships.sibling") },
        ]}
        onChange={onRelationshipChange}
      />
    </>
  );
}
