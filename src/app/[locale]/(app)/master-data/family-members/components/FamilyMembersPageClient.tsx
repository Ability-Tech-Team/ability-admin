"use client";

import { useState, useMemo } from "react";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import type { FamilyMemberRecord } from "@/src/services/familyMembers";
import FamilyMemberToolbarWithModal from "./FamilyMemberToolbarWithModal";
import FamilyMemberFilters from "./FamilyMemberFilters";
import FamilyMembersTable from "./FamilyMembersTable";

type Props = {
  data: FamilyMemberRecord[];
  projectOptions: { value: string; label: string }[];
  labels: ToolbarLabels;
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export default function FamilyMembersPageClient({ data, projectOptions, labels }: Props) {
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [projectFilter, setProjectFilter] = useState<Set<string>>(new Set());
  const [relationshipFilter, setRelationshipFilter] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = data;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.ownerName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.mobile.includes(q) ||
          m.project.toLowerCase().includes(q) ||
          m.assignedUnit.toLowerCase().includes(q),
      );
    }

    if (statusFilter.size > 0) {
      result = result.filter((m) => statusFilter.has(m.requestStatus));
    }

    if (projectFilter.size > 0) {
      result = result.filter((m) => projectFilter.has(slugify(m.project)));
    }

    if (relationshipFilter.size > 0) {
      result = result.filter((m) =>
        relationshipFilter.has(m.relationship.toLowerCase()),
      );
    }

    return result;
  }, [data, search, statusFilter, projectFilter, relationshipFilter]);

  return (
    <>
      <FamilyMemberToolbarWithModal
        labels={labels}
        onStatusChange={setStatusFilter}
        onSearch={setSearch}
        extraFilters={
          <FamilyMemberFilters
            projectOptions={projectOptions}
            onProjectChange={setProjectFilter}
            onRelationshipChange={setRelationshipFilter}
          />
        }
      />
      <div className="px-5">
        <FamilyMembersTable data={filtered} />
      </div>
    </>
  );
}
