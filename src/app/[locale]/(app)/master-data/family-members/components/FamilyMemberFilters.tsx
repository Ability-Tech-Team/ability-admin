"use client";

import { useTranslations } from "next-intl";
import FilterDropdown from "@/src/components/FilterDropdown";

type Props = {
  onProjectChange?: (selected: Set<string>) => void;
  onRelationshipChange?: (selected: Set<string>) => void;
};

export default function FamilyMemberFilters({ onProjectChange, onRelationshipChange }: Props) {
  const t = useTranslations("MasterData");

  return (
    <>
      <FilterDropdown
        label={t("filters.projects")}
        options={[
          { value: "marina-heights", label: "Marina Heights" },
          { value: "palm-residences", label: "Palm Residences" },
          { value: "corniche-gardens", label: "Corniche Gardens" },
          { value: "downtown-towers", label: "Downtown Towers" },
          { value: "business-bay", label: "Business Bay Complex" },
        ]}
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
