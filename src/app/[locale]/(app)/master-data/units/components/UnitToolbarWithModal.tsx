"use client";

import { useTranslations } from "next-intl";
import Toolbar, { type ToolbarLabels } from "@/src/components/Toolbar";

type Props = {
  labels: ToolbarLabels;
  extraFilters?: React.ReactNode;
  onStatusChange?: (selected: Set<string>) => void;
  onSearch?: (query: string) => void;
  onExactSearchChange?: (exact: boolean) => void;
  onExport?: () => void;
  onImport?: () => void;
};

// The Toolbar's own add button style, with a disabled state.
const addButton =
  "flex items-center gap-1 rounded-md bg-blue-600 px-3 h-7 text-[10.5px] font-medium text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600";

/**
 * The units toolbar. Add Unit is shown disabled: its form needs unit types and locations, and
 * no admin route lists them yet. The Toolbar's own add button can't be disabled, so this draws
 * it in the same place.
 */
export default function UnitToolbarWithModal({
  labels,
  extraFilters,
  onStatusChange,
  onSearch,
  onExactSearchChange,
  onExport,
  onImport,
}: Props) {
  const t = useTranslations("MasterData");
  const tUnits = useTranslations("UnitsScreen");

  return (
    <Toolbar
      labels={{ ...labels, addLabel: "" }}
      statusOptions={[
        { value: "active", label: t("active") },
        { value: "inactive", label: t("inactive") },
      ]}
      extraFilters={extraFilters}
      onStatusChange={onStatusChange}
      onSearch={onSearch}
      onExactSearchChange={onExactSearchChange}
      onExport={onExport}
      onImport={onImport}
      trailingContent={
        labels.addLabel && (
          <button type="button" disabled title={tUnits("notAvailableYet")} className={addButton}>
            {labels.addLabel}
          </button>
        )
      }
    />
  );
}
