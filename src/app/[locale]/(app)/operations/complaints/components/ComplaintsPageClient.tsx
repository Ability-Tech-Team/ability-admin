"use client";

import { useState, useMemo } from "react";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import type { Complaint } from "@/src/services/complaints";
import ComplaintToolbarWithModal from "./ComplaintToolbarWithModal";
import ComplaintFilters from "./ComplaintFilters";
import ComplaintsTable from "./ComplaintsTable";

type Props = {
  data: Complaint[];
  labels: ToolbarLabels;
};

export default function ComplaintsPageClient({ data, labels }: Props) {
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [priorityFilter, setPriorityFilter] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = data;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.complaintId.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          c.project.toLowerCase().includes(q) ||
          c.submittedBy.toLowerCase().includes(q) ||
          c.assignedTo.toLowerCase().includes(q),
      );
    }

    if (statusFilter.size > 0) {
      result = result.filter((c) => statusFilter.has(c.status));
    }

    if (priorityFilter.size > 0) {
      result = result.filter((c) => priorityFilter.has(c.priority));
    }

    return result;
  }, [data, search, statusFilter, priorityFilter]);

  return (
    <>
      <ComplaintToolbarWithModal
        labels={labels}
        onStatusChange={setStatusFilter}
        onSearch={setSearch}
        extraFilters={
          <ComplaintFilters onPriorityChange={setPriorityFilter} />
        }
      />
      <ComplaintsTable data={filtered} />
    </>
  );
}
