"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import PageHeader from "@/src/components/PageHeader";
import StatCard from "@/src/components/StatCard";
import ToggleSwitch from "@/src/components/ToggleSwitch";
import ServiceRequestChart from "./ServiceRequestChart";
import OccupancyByProject from "./OccupancyByProject";
import QuickMetrics from "./QuickMetrics";
import ProjectsOverview from "./ProjectsOverview";
import RecentServiceRequests from "./RecentServiceRequests";
import type {
  DashboardStat,
  ServiceRequestMonth,
  ProjectOccupancy,
  QuickMetric,
  DashboardProject,
  RecentServiceRequest,
} from "@/src/services/dashboard";
import {
  ProjectsIcon,
  UnitsIcon,
  CustomersIcon,
  OwnersIcon,
  GuestsIcon,
  TenantsIcon,
  OccupancyIcon,
  ServiceRequestsIcon,
  ComplaintsIcon,
  OverdueInvoicesIcon,
  InvoiceValueIcon,
  CollectedIcon,
  OverdueValueIcon,
} from "./DashboardIcons";

/** Widget keys — the order here is the default display order. */
type WidgetKey = "kpiCards" | "srTrendChart" | "occupancyRates" | "quickMetrics" | "recentServiceRequests" | "projectsOverview";

/** Card visual configuration — icon, color, and route. */
const cardConfig: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    iconColor: string;
    href: string;
  }
> = {
  totalProjects:       { icon: ProjectsIcon,        iconBg: "bg-blue-50",    iconColor: "text-blue-500",    href: "/master-data/projects" },
  totalUnits:          { icon: UnitsIcon,            iconBg: "bg-blue-50",    iconColor: "text-blue-500",    href: "/master-data/units" },
  activeCustomers:     { icon: CustomersIcon,        iconBg: "bg-purple-50",  iconColor: "text-purple-500",  href: "/master-data/customers" },
  totalOwners:         { icon: OwnersIcon,           iconBg: "bg-purple-50",  iconColor: "text-purple-500",  href: "/master-data/unit-assignment" },
  totalGuests:         { icon: GuestsIcon,           iconBg: "bg-purple-50",  iconColor: "text-purple-500",  href: "/operations/guest-invitations" },
  totalTenants:        { icon: TenantsIcon,          iconBg: "bg-purple-50",  iconColor: "text-purple-500",  href: "/master-data/rental-management" },
  avgOccupancy:        { icon: OccupancyIcon,        iconBg: "bg-purple-50",  iconColor: "text-purple-500",  href: "/master-data/units" },
  openServiceRequests: { icon: ServiceRequestsIcon,  iconBg: "bg-orange-50",  iconColor: "text-orange-400",  href: "/operations/service-requests" },
  openComplaints:      { icon: ComplaintsIcon,       iconBg: "bg-orange-50",  iconColor: "text-orange-400",  href: "/operations/complaints" },
  overdueInvoices:     { icon: OverdueInvoicesIcon,  iconBg: "bg-red-50",     iconColor: "text-red-500",     href: "/operations/invoices-payments" },
  totalInvoiceValue:   { icon: InvoiceValueIcon,     iconBg: "bg-blue-50",    iconColor: "text-blue-500",    href: "/operations/invoices-payments" },
  collectedInvoices:   { icon: CollectedIcon,        iconBg: "bg-emerald-50", iconColor: "text-emerald-500", href: "/operations/invoices-payments" },
  overdueInvoiceValue: { icon: OverdueValueIcon,     iconBg: "bg-red-50",     iconColor: "text-red-500",     href: "/operations/invoices-payments" },
};

/** Order the backend stats should appear in the grid. */
const statOrder = [
  "totalProjects",
  "totalUnits",
  "activeCustomers",
  "totalOwners",
  "totalGuests",
  "totalTenants",
  "avgOccupancy",
  "openServiceRequests",
  "openComplaints",
  "overdueInvoices",
  "totalInvoiceValue",
  "collectedInvoices",
  "overdueInvoiceValue",
];

/** Format a number with commas. */
function fmt(n: number): string {
  return n.toLocaleString();
}

/** Build the display value: prefix + formatted number + suffix. */
function displayValue(stat: DashboardStat): string {
  const parts: string[] = [];
  if (stat.prefix) parts.push(stat.prefix);
  parts.push(fmt(stat.value));
  if (stat.suffix) parts.push(stat.suffix);
  return parts.join(" ");
}

type DashboardContentProps = {
  stats: DashboardStat[];
  serviceRequests: ServiceRequestMonth[];
  occupancy: ProjectOccupancy[];
  quickMetrics: QuickMetric[];
  projects: DashboardProject[];
  recentRequests: RecentServiceRequest[];
};

/** Format today or an offset as YYYY-MM-DD for the date input. */
function toDateString(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
}

const defaultWidgetOrder: WidgetKey[] = [
  "kpiCards",
  "srTrendChart",
  "occupancyRates",
  "quickMetrics",
  "recentServiceRequests",
  "projectsOverview",
];

export default function DashboardContent({
  stats,
  serviceRequests,
  occupancy,
  quickMetrics: quickMetricsData,
  projects,
  recentRequests,
}: DashboardContentProps) {
  const t = useTranslations("Dashboard");
  const tSide = useTranslations("SideMenu");
  const tHeader = useTranslations("PageHeader");

  const [dateFrom, setDateFrom] = useState(toDateString(-13));
  const [dateTo, setDateTo] = useState(toDateString(0));
  const [showWidgetManager, setShowWidgetManager] = useState(false);
  const [widgetOrder, setWidgetOrder] = useState<WidgetKey[]>(defaultWidgetOrder);
  const [widgetVisible, setWidgetVisible] = useState<Record<WidgetKey, boolean>>({
    kpiCards: true,
    srTrendChart: true,
    occupancyRates: true,
    quickMetrics: true,
    recentServiceRequests: true,
    projectsOverview: true,
  });

  // Drag state — use a ref so handleDragOver always reads the current index
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const dragIdxRef = useRef<number | null>(null);

  const handleDragStart = useCallback((idx: number) => {
    dragIdxRef.current = idx;
    setDragIdx(idx);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const from = dragIdxRef.current;
    if (from === null || from === idx) return;
    setWidgetOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    dragIdxRef.current = idx;
    setDragIdx(idx);
  }, []);

  const handleDragEnd = useCallback(() => {
    dragIdxRef.current = null;
    setDragIdx(null);
  }, []);

  const toggleWidget = useCallback((key: WidgetKey) => {
    setWidgetVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const ordered = statOrder
    .map((key) => stats.find((s) => s.key === key))
    .filter((s): s is DashboardStat => s != null);

  /** Render a widget section by key. */
  const renderWidget = (key: WidgetKey) => {
    if (!widgetVisible[key]) return null;
    switch (key) {
      case "kpiCards":
        return (
          <div key={key} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
            {ordered.map((stat) => {
              const cfg = cardConfig[stat.key];
              if (!cfg) return null;
              const Icon = cfg.icon;
              return (
                <StatCard
                  key={stat.key}
                  value={displayValue(stat)}
                  label={t(stat.key as Parameters<typeof t>[0])}
                  change={stat.change}
                  icon={<Icon className={`h-[13px] w-[13px] ${cfg.iconColor}`} />}
                  iconBg={cfg.iconBg}
                  href={cfg.href}
                />
              );
            })}
          </div>
        );
      case "srTrendChart":
        return (
          <div key={key} className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 px-1">
            <ServiceRequestChart data={serviceRequests} />
            {widgetVisible.occupancyRates && <OccupancyByProject data={occupancy} />}
          </div>
        );
      case "occupancyRates":
        // Rendered inline with srTrendChart when both visible; standalone otherwise
        if (widgetVisible.srTrendChart) return null;
        return (
          <div key={key} className="px-1">
            <OccupancyByProject data={occupancy} />
          </div>
        );
      case "quickMetrics":
        return (
          <div key={key} className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 px-1">
            <QuickMetrics data={quickMetricsData} />
            {widgetVisible.projectsOverview && <ProjectsOverview data={projects} />}
          </div>
        );
      case "projectsOverview":
        // Rendered inline with quickMetrics when both visible; standalone otherwise
        if (widgetVisible.quickMetrics) return null;
        return (
          <div key={key} className="px-1">
            <ProjectsOverview data={projects} />
          </div>
        );
      case "recentServiceRequests":
        return (
          <div key={key} className="px-1">
            <RecentServiceRequests data={recentRequests} viewAllHref="/operations/service-requests" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        breadcrumbs={[
          { label: tSide("adminPanel"), href: "/" },
          { label: t("title") },
        ]}
        title={t("title")}
        subtitle={t("subtitle")}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        action={
          <button
            type="button"
            onClick={() => setShowWidgetManager((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 h-9 text-[13px] font-medium text-gray-600 hover:bg-blue-50 hover:border-blue-400 transition-colors self-end"
          >
            <WidgetsIcon className="h-4 w-4 text-gray-500" />
            {tHeader("widgets")}
          </button>
        }
      />

      {/* Widget Manager panel */}
      {showWidgetManager && (
        <div className="mx-1 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-[14px] font-bold text-gray-900">{t("widgetManager")}</h3>
              <p className="text-[11px] text-gray-400">{t("widgetManagerSubtitle")}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowWidgetManager(false)}
              className="rounded-lg border border-gray-200 px-4 py-1.5 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {t("done")}
            </button>
          </div>
          <div className="flex flex-col">
            {widgetOrder.map((key, idx) => (
              <div
                key={key}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between border-b border-gray-50 py-3 last:border-b-0 cursor-grab active:cursor-grabbing ${
                  dragIdx === idx ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <DragHandleIcon className="h-4 w-4 text-gray-300" />
                  <span className="text-[13px] font-medium text-gray-700">
                    {t(`widget_${key}` as Parameters<typeof t>[0])}
                  </span>
                </div>
                <ToggleSwitch
                  checked={widgetVisible[key]}
                  onChange={() => toggleWidget(key)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard widgets in configured order */}
      {widgetOrder.map(renderWidget)}
    </div>
  );
}

function DragHandleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM7 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM7 13a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
    </svg>
  );
}

function WidgetsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M2 4.5A.5.5 0 0 1 2.5 4h15a.5.5 0 0 1 0 1h-15a.5.5 0 0 1-.5-.5Zm0 5A.5.5 0 0 1 2.5 9h15a.5.5 0 0 1 0 1h-15a.5.5 0 0 1-.5-.5Zm0 5a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 0 1h-15a.5.5 0 0 1-.5-.5Z" />
    </svg>
  );
}
