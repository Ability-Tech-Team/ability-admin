"use client";

import { useState, useMemo } from "react";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import type { Unit } from "@/src/services/units";
import UnitToolbarWithModal from "./UnitToolbarWithModal";
import ContractFilter from "./ContractFilter";
import UnitsTable from "./UnitsTable";

type Props = {
  data: Unit[];
  labels: ToolbarLabels;
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export default function UnitsPageClient({ data, labels }: Props) {
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [projectFilter, setProjectFilter] = useState<Set<string>>(new Set());
  const [contractFilter, setContractFilter] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = data;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.unitId.toLowerCase().includes(q) ||
          u.number.toLowerCase().includes(q) ||
          u.type.toLowerCase().includes(q) ||
          u.project.toLowerCase().includes(q) ||
          u.building.toLowerCase().includes(q) ||
          (u.owner?.name.toLowerCase().includes(q) ?? false),
      );
    }

    if (statusFilter.size > 0) {
      result = result.filter((u) => {
        const status = u.active ? "active" : "inactive";
        return statusFilter.has(status);
      });
    }

    if (projectFilter.size > 0) {
      result = result.filter((u) => projectFilter.has(slugify(u.project)));
    }

    if (contractFilter.size > 0) {
      result = result.filter((u) => u.contract && contractFilter.has(u.contract));
    }

    return result;
  }, [data, search, statusFilter, projectFilter, contractFilter]);

  return (
    <>
      <UnitToolbarWithModal
        labels={labels}
        onStatusChange={setStatusFilter}
        onSearch={setSearch}
        extraFilters={
          <ContractFilter
            onProjectChange={setProjectFilter}
            onContractChange={setContractFilter}
          />
        }
      />
      <div className="px-5">
        <UnitsTable data={filtered} />
      </div>
    </>
  );
}
