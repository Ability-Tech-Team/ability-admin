"use client";

import { useState, useMemo } from "react";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import type { Rental } from "@/src/services/rentals";
import RentalToolbarWithModal from "./RentalToolbarWithModal";
import RentalFilters, { PrintRCButton } from "./RentalFilters";
import RentalsTable from "./RentalsTable";

type Props = {
  data: Rental[];
  labels: ToolbarLabels;
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export default function RentalManagementPageClient({ data, labels }: Props) {
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [projectFilter, setProjectFilter] = useState<Set<string>>(new Set());
  const [sourceFilter, setSourceFilter] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = data;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.rentalId.toLowerCase().includes(q) ||
          r.unit.toLowerCase().includes(q) ||
          r.project.toLowerCase().includes(q) ||
          r.tenantName.toLowerCase().includes(q),
      );
    }

    if (statusFilter.size > 0) {
      result = result.filter((r) => statusFilter.has(r.status));
    }

    if (projectFilter.size > 0) {
      result = result.filter((r) => projectFilter.has(slugify(r.project)));
    }

    if (sourceFilter.size > 0) {
      result = result.filter((r) =>
        sourceFilter.has(r.source.toLowerCase()),
      );
    }

    return result;
  }, [data, search, statusFilter, projectFilter, sourceFilter]);

  return (
    <>
      <RentalToolbarWithModal
        labels={labels}
        leadingContent={<PrintRCButton />}
        onStatusChange={setStatusFilter}
        onSearch={setSearch}
        extraFilters={
          <RentalFilters
            onProjectChange={setProjectFilter}
            onSourceChange={setSourceFilter}
          />
        }
      />
      <div className="px-5">
        <RentalsTable data={filtered} />
      </div>
    </>
  );
}
