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
  /** Opens Add Unit (`AddUnitModal`, drawn by the page with the import modal). */
  onAdd?: () => void;
};

/** The units toolbar: search, status, project filter, export, import and Add Unit. */
export default function UnitToolbarWithModal({
  labels,
  extraFilters,
  onStatusChange,
  onSearch,
  onExactSearchChange,
  onExport,
  onImport,
  onAdd,
}: Props) {
  const t = useTranslations("MasterData");

  return (
    <Toolbar
      labels={labels}
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
      onAdd={onAdd}
    />
  );
}
