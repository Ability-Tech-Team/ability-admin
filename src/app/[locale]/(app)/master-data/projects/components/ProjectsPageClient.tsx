"use client";

import { useState, useMemo } from "react";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import type { Project } from "@/src/services/projects";
import ProjectToolbarWithModal from "./ProjectToolbarWithModal";
import ProjectFilters from "./ProjectFilters";
import ProjectsTable from "./ProjectsTable";

type Props = {
  data: Project[];
  labels: ToolbarLabels;
};

export default function ProjectsPageClient({ data, labels }: Props) {
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = data;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameAr.includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.manager.toLowerCase().includes(q),
      );
    }

    if (statusFilter.size > 0) {
      result = result.filter((p) => {
        const status = p.active ? "active" : "inactive";
        return statusFilter.has(status);
      });
    }

    if (typeFilter.size > 0) {
      result = result.filter((p) => typeFilter.has(p.type));
    }

    return result;
  }, [data, search, statusFilter, typeFilter]);

  return (
    <>
      <ProjectToolbarWithModal
        labels={labels}
        onStatusChange={setStatusFilter}
        onSearch={setSearch}
        extraFilters={<ProjectFilters onTypeChange={setTypeFilter} />}
      />
      <div className="px-5">
        <ProjectsTable data={filtered} />
      </div>
    </>
  );
}
