"use client";

import { useState, useMemo } from "react";
import type { AuditLogEntry, AuditLogStats } from "@/src/services/auditLog";
import FilterDropdown from "@/src/components/FilterDropdown";
import AuditLogStatsCards from "./AuditLogStatsCards";
import AuditLogTable from "./AuditLogTable";
import AuditLogTimeline from "./AuditLogTimeline";

type Props = {
  data: AuditLogEntry[];
  stats: AuditLogStats;
  moduleOptions: { value: string; label: string }[];
  statsLabels: {
    actionsToday: string;
    thisWeek: string;
    activeAdminsToday: string;
    contentPublished: string;
  };
  labels: {
    searchPlaceholder: string;
    exactSearch: string;
    modules: string;
    table: string;
    timeline: string;
    from: string;
    to: string;
  };
};

function toDateStr(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
}

export default function AuditLogPageClient({ data, stats, moduleOptions, statsLabels, labels }: Props) {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"table" | "timeline">("table");
  const [dateFrom, setDateFrom] = useState(toDateStr(-1));
  const [dateTo, setDateTo] = useState(toDateStr(0));

  const filtered = useMemo(() => {
    let result = data;
    if (moduleFilter.size > 0) {
      result = result.filter((e) => moduleFilter.has(e.module.toLowerCase().replace(/\s+/g, "-")));
    }
    if (dateFrom) {
      result = result.filter((e) => e.timestamp.slice(0, 10) >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((e) => e.timestamp.slice(0, 10) <= dateTo);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.action.toLowerCase().includes(q) ||
          e.userName.toLowerCase().includes(q) ||
          e.detail.toLowerCase().includes(q) ||
          e.module.toLowerCase().includes(q),
      );
    }
    return result;
  }, [data, moduleFilter, dateFrom, dateTo, search]);

  return (
    <div className="flex flex-col gap-4">
      <AuditLogStatsCards stats={stats} labels={statsLabels} />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-5">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <svg className="absolute start-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={labels.searchPlaceholder}
              className="h-9 w-[240px] rounded-lg border border-gray-200 bg-white ps-7 pe-2 text-[10.5px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </div>

          {/* Exact search */}
          <label className="flex items-center gap-1 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-[12px] text-gray-500">{labels.exactSearch}</span>
          </label>

          {/* Modules filter */}
          <FilterDropdown
            label={labels.modules}
            options={moduleOptions}
            onChange={setModuleFilter}
          />

          {/* Table / Timeline toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setView("table")}
              className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium transition-colors ${
                view === "table"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              {labels.table}
            </button>
            <button
              type="button"
              onClick={() => setView("timeline")}
              className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium transition-colors ${
                view === "timeline"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {labels.timeline}
            </button>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-[11px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
            <span className="text-[11px] text-gray-400">{labels.to}</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-[11px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>
      </div>

      {view === "table" ? <AuditLogTable data={filtered} /> : <AuditLogTimeline data={filtered} />}
    </div>
  );
}
