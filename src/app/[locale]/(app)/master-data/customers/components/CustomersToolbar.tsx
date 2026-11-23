"use client";

import { useTranslations } from "next-intl";
import Toolbar, { type ToolbarLabels } from "@/src/components/Toolbar";
import { SEARCH_FIELDS } from "../schema";
import type { CustomerSearchField } from "../types";
import SearchFieldSelect from "./SearchFieldSelect";

type Props = {
  labels: ToolbarLabels;
  extraFilters?: React.ReactNode;
  onSearch: (query: string) => void;
  searchField: CustomerSearchField;
  onSearchFieldChange: (field: CustomerSearchField) => void;
  onAdd: () => void;
  onImport: () => void;
  onExport: () => void;
};

/**
 * The customers toolbar. The API searches one field at a time, chosen before the box. The list
 * has no status filter in the API, so the toolbar's Status list is left empty.
 */
export default function CustomersToolbar({
  labels,
  extraFilters,
  onSearch,
  searchField,
  onSearchFieldChange,
  onAdd,
  onImport,
  onExport,
}: Props) {
  const tc = useTranslations("CustomersScreen");

  return (
    <Toolbar
      labels={labels}
      statusOptions={[]}
      leadingContent={
        <SearchFieldSelect
          label={tc("searchBy")}
          value={searchField}
          options={SEARCH_FIELDS.map((field) => ({ value: field, label: tc(`searchFields.${field}`) }))}
          onChange={onSearchFieldChange}
        />
      }
      extraFilters={extraFilters}
      onSearch={onSearch}
      onAdd={onAdd}
      onImport={onImport}
      onExport={onExport}
    />
  );
}
