"use client";

import { useState, useMemo } from "react";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import type { Customer } from "@/src/services/customers";
import CustomerToolbarWithModal from "./CustomerToolbarWithModal";
import CustomerFilters from "./CustomerFilters";
import CustomersTable from "./CustomersTable";

type Props = {
  data: Customer[];
  labels: ToolbarLabels;
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export default function CustomersPageClient({ data, labels }: Props) {
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [projectFilter, setProjectFilter] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = data;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.nameAr.includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.project.toLowerCase().includes(q) ||
          c.unit.toLowerCase().includes(q),
      );
    }

    if (statusFilter.size > 0) {
      result = result.filter((c) => {
        const status = c.active ? "active" : "inactive";
        return statusFilter.has(status);
      });
    }

    if (projectFilter.size > 0) {
      result = result.filter((c) => projectFilter.has(slugify(c.project)));
    }

    if (typeFilter.size > 0) {
      result = result.filter((c) => typeFilter.has(c.customerType));
    }

    return result;
  }, [data, search, statusFilter, projectFilter, typeFilter]);

  return (
    <>
      <CustomerToolbarWithModal
        labels={labels}
        onStatusChange={setStatusFilter}
        onSearch={setSearch}
        extraFilters={
          <CustomerFilters
            onProjectChange={setProjectFilter}
            onTypeChange={setTypeFilter}
          />
        }
      />
      <div className="px-5">
        <CustomersTable data={filtered} />
      </div>
    </>
  );
}
