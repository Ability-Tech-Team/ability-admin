"use client";

import { useTranslations } from "next-intl";
import FilterDropdown from "@/src/components/FilterDropdown";

type Props = {
  onProjectChange?: (selected: Set<string>) => void;
  onContractChange?: (selected: Set<string>) => void;
};

export default function ContractFilter({ onProjectChange, onContractChange }: Props) {
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
        label={t("contract")}
        options={[
          { value: "annual", label: t("contractTypes.annual") },
          { value: "monthly", label: t("contractTypes.monthly") },
        ]}
        onChange={onContractChange}
      />
    </>
  );
}
