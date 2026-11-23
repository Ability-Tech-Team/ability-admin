"use client";

import { useTranslations } from "next-intl";
import Toolbar, { type ToolbarLabels } from "@/src/components/Toolbar";
import SearchFieldSelect from "../../customers/components/SearchFieldSelect";
import type { FamilyMemberSearchField } from "../types";

type Props = {
  labels: ToolbarLabels;
  extraFilters?: React.ReactNode;
  onStatusChange: (selected: Set<string>) => void;
  onSearch: (query: string) => void;
  searchField: FamilyMemberSearchField;
  onSearchFieldChange: (field: FamilyMemberSearchField) => void;
  onImport: () => void;
  onExport: () => void;
  onAdd: () => void;
};

const searchFields: FamilyMemberSearchField[] = ["unit", "ownerMobile", "relativeId"];

/**
 * The family members toolbar. The list shows the owners' requests from the community app; Add
 * Member adds a relative directly (`POST /customers/relatives`).
 */
export default function FamilyMembersToolbar({
  labels,
  extraFilters,
  onStatusChange,
  onSearch,
  searchField,
  onSearchFieldChange,
  onImport,
  onExport,
  onAdd,
}: Props) {
  const t = useTranslations("MasterData");
  const tf = useTranslations("FamilyMembersScreen");
  const tc = useTranslations("CustomersScreen");

  return (
    <Toolbar
      labels={labels}
      statusOptions={[
        { value: "pending", label: t("familyColumns.statuses.pending") },
        { value: "approved", label: t("familyColumns.statuses.approved") },
        { value: "rejected", label: t("familyColumns.statuses.rejected") },
      ]}
      leadingContent={
        <SearchFieldSelect
          label={tc("searchBy")}
          value={searchField}
          options={searchFields.map((field) => ({ value: field, label: tf(`searchFields.${field}`) }))}
          onChange={onSearchFieldChange}
        />
      }
      extraFilters={extraFilters}
      onStatusChange={onStatusChange}
      onSearch={onSearch}
      onImport={onImport}
      onExport={onExport}
      onAdd={onAdd}
    />
  );
}
