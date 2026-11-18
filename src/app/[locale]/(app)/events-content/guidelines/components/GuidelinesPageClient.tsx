"use client";

import { useState, useMemo } from "react";
import type { Guideline, GuidelineStats } from "@/src/services/guidelines";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import Toolbar from "@/src/components/Toolbar";
import FilterDropdown from "@/src/components/FilterDropdown";
import GuidelineStatsCards from "./GuidelineStatsCards";
import GuidelinesTable from "./GuidelinesTable";
import NewGuidelineModal from "./NewGuidelineModal";

type Props = {
  data: Guideline[];
  stats: GuidelineStats;
  labels: ToolbarLabels;
  statsLabels: {
    published: string;
    publishedSub: string;
    draft: string;
    draftSub: string;
    sections: string;
    sectionsSub: string;
  };
  projectsLabel: string;
  projectOptions: { value: string; label: string }[];
};

export default function GuidelinesPageClient({ data, stats, labels, statsLabels, projectsLabel, projectOptions }: Props) {
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState<Set<string>>(new Set());
  const [showNew, setShowNew] = useState(false);

  const filtered = useMemo(() => {
    let result = data;
    if (projectFilter.size > 0) {
      result = result.filter((g) => projectFilter.has(g.project.toLowerCase().replace(/\s+/g, "-")));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.titleEn.toLowerCase().includes(q) ||
          g.titleAr.includes(q) ||
          g.project.toLowerCase().includes(q),
      );
    }
    return result;
  }, [data, projectFilter, search]);

  return (
    <div className="flex flex-col gap-4">
      {showNew && <NewGuidelineModal projectOptions={projectOptions} onClose={() => setShowNew(false)} />}
      <GuidelineStatsCards stats={stats} labels={statsLabels} />
      <Toolbar
        labels={labels}
        hideStatus
        onSearch={setSearch}
        onAdd={() => setShowNew(true)}
        extraFilters={
          <FilterDropdown
            label={projectsLabel}
            options={projectOptions}
            onChange={setProjectFilter}
          />
        }
      />
      <GuidelinesTable data={filtered} projectOptions={projectOptions} />
    </div>
  );
}
