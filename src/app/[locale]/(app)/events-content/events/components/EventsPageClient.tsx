"use client";

import { useState, useMemo } from "react";
import type { CommunityEvent } from "@/src/services/events";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import EventToolbarWithModal from "./EventToolbarWithModal";
import EventFilters from "./EventFilters";
import EventsGrid from "./EventsGrid";
import EventsListTable from "./EventsListTable";

type Props = {
  data: CommunityEvent[];
  projectOptions: { value: string; label: string }[];
  labels: ToolbarLabels;
};

export default function EventsPageClient({ data, projectOptions, labels }: Props) {
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [projectFilter, setProjectFilter] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    let result = data;
    if (statusFilter.size > 0) {
      result = result.filter((e) => statusFilter.has(e.status));
    }
    if (projectFilter.size > 0) {
      result = result.filter((e) => projectFilter.has(e.project.toLowerCase().replace(/\s+/g, "-")));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.nameEn.toLowerCase().includes(q) ||
          e.nameAr.includes(q) ||
          e.project.toLowerCase().includes(q),
      );
    }
    return result;
  }, [data, statusFilter, projectFilter, search]);

  return (
    <div className="flex flex-col gap-4">
      <EventToolbarWithModal
        labels={labels}
        projectOptions={projectOptions}
        extraFilters={<EventFilters projectOptions={projectOptions} onProjectChange={setProjectFilter} />}
        onStatusChange={setStatusFilter}
        onSearch={setSearch}
        view={view}
        onViewChange={setView}
      />
      {view === "grid" ? <EventsGrid data={filtered} /> : <EventsListTable data={filtered} />}
    </div>
  );
}
