"use client";

import { useState, useMemo } from "react";
import type { PhoneContact } from "@/src/services/phoneDirectory";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import Toolbar from "@/src/components/Toolbar";
import PhoneDirectoryGrid from "./PhoneDirectoryGrid";

type Props = {
  data: PhoneContact[];
  labels: ToolbarLabels;
};

export default function PhoneDirectoryPageClient({ data, labels }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.project.toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <div className="flex flex-col gap-4">
      <Toolbar labels={labels} onSearch={setSearch} />
      <PhoneDirectoryGrid data={filtered} />
    </div>
  );
}
