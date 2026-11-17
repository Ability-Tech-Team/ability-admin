"use client";

import { useState, useMemo } from "react";
import Toolbar, { type ToolbarLabels } from "@/src/components/Toolbar";
import type { UnitAssignment } from "@/src/services/unitAssignments";
import AssignmentFilters from "./AssignmentFilters";
import UnitAssignmentTable from "./UnitAssignmentTable";

type Props = {
  data: UnitAssignment[];
  labels: ToolbarLabels;
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export default function UnitAssignmentPageClient({ data, labels }: Props) {
  const [projectFilter, setProjectFilter] = useState<Set<string>>(new Set());
  const [occupancyFilter, setOccupancyFilter] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = data;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.assignmentId.toLowerCase().includes(q) ||
          a.unitNumber.toLowerCase().includes(q) ||
          a.customerName.toLowerCase().includes(q) ||
          a.project.toLowerCase().includes(q),
      );
    }

    if (projectFilter.size > 0) {
      result = result.filter((a) => projectFilter.has(slugify(a.project)));
    }

    if (occupancyFilter.size > 0) {
      result = result.filter((a) => occupancyFilter.has(a.occupancyType));
    }

    return result;
  }, [data, search, projectFilter, occupancyFilter]);

  return (
    <>
      <Toolbar
        labels={labels}
        onSearch={setSearch}
        extraFilters={
          <AssignmentFilters
            onProjectChange={setProjectFilter}
            onOccupancyChange={setOccupancyFilter}
          />
        }
      />
      <div className="px-5">
        <UnitAssignmentTable data={filtered} />
      </div>
    </>
  );
}
