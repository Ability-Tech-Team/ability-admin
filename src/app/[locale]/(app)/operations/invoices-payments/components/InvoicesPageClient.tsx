"use client";

import { useState, useMemo } from "react";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import type { Invoice } from "@/src/services/invoices";
import InvoiceToolbarWithModal from "./InvoiceToolbarWithModal";
import { InvoiceProjectsFilter, InvoiceTypeFilter, MaintenanceDepositButton } from "./InvoiceFilters";
import InvoicesTable from "./InvoicesTable";

type Props = {
  data: Invoice[];
  labels: ToolbarLabels;
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export default function InvoicesPageClient({ data, labels }: Props) {
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [projectFilter, setProjectFilter] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = data;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.invoiceId.toLowerCase().includes(q) ||
          inv.customer.toLowerCase().includes(q) ||
          inv.project.toLowerCase().includes(q) ||
          inv.unit.toLowerCase().includes(q),
      );
    }

    if (statusFilter.size > 0) {
      result = result.filter((inv) => statusFilter.has(inv.status));
    }

    if (projectFilter.size > 0) {
      result = result.filter((inv) => projectFilter.has(slugify(inv.project)));
    }

    if (typeFilter.size > 0) {
      result = result.filter((inv) => typeFilter.has(inv.invoiceType));
    }

    return result;
  }, [data, search, statusFilter, projectFilter, typeFilter]);

  return (
    <>
      <InvoiceToolbarWithModal
        labels={labels}
        trailingContent={<MaintenanceDepositButton />}
        onStatusChange={setStatusFilter}
        onSearch={setSearch}
        extraFilters={
          <>
            <InvoiceProjectsFilter onChange={setProjectFilter} />
            <InvoiceTypeFilter onChange={setTypeFilter} />
          </>
        }
      />
      <InvoicesTable data={filtered} />
    </>
  );
}
