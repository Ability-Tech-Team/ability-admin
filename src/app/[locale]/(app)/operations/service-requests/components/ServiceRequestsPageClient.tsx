"use client";

import { useState, useMemo } from "react";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import type { ServiceRequest } from "@/src/services/serviceRequests";
import ServiceRequestToolbarWithModal from "./ServiceRequestToolbarWithModal";
import ServiceRequestFilters from "./ServiceRequestFilters";
import ServiceRequestsTable from "./ServiceRequestsTable";

type Props = {
  data: ServiceRequest[];
  projectOptions: { value: string; label: string }[];
  labels: ToolbarLabels;
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export default function ServiceRequestsPageClient({ data, projectOptions, labels }: Props) {
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [projectFilter, setProjectFilter] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = data;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.requestId.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.project.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.assignedTo.toLowerCase().includes(q),
      );
    }

    if (statusFilter.size > 0) {
      result = result.filter((r) => statusFilter.has(r.status));
    }

    if (projectFilter.size > 0) {
      result = result.filter((r) => projectFilter.has(slugify(r.project)));
    }

    return result;
  }, [data, search, statusFilter, projectFilter]);

  return (
    <>
      <ServiceRequestToolbarWithModal
        labels={labels}
        onStatusChange={setStatusFilter}
        onSearch={setSearch}
        extraFilters={
          <ServiceRequestFilters projectOptions={projectOptions} onProjectChange={setProjectFilter} />
        }
      />
      <ServiceRequestsTable data={filtered} />
    </>
  );
}
