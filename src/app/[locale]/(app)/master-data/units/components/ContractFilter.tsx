"use client";

import { useTranslations } from "next-intl";
import FilterDropdown from "@/src/components/FilterDropdown";

type Props = {
  projectOptions: { value: string; label: string }[];
  onProjectChange?: (selected: Set<string>) => void;
  onContractChange?: (selected: Set<string>) => void;
};

export default function ContractFilter({ projectOptions, onProjectChange, onContractChange }: Props) {
  const t = useTranslations("MasterData");

  return (
    <>
      <FilterDropdown
        label={t("filters.projects")}
        options={projectOptions}
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
