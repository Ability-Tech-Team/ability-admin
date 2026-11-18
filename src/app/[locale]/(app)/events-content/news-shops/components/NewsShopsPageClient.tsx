"use client";

import { useState, useMemo } from "react";
import type { Article } from "@/src/services/newsShops";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import Toolbar from "@/src/components/Toolbar";
import NewsShopsTable from "./NewsShopsTable";

type Props = {
  data: Article[];
  labels: ToolbarLabels;
};

export default function NewsShopsPageClient({ data, labels }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (a) =>
        a.titleEn.toLowerCase().includes(q) ||
        a.titleAr.includes(q) ||
        a.project.toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <div className="flex flex-col gap-4">
      <Toolbar labels={labels} onSearch={setSearch} />
      <NewsShopsTable data={filtered} />
    </div>
  );
}
