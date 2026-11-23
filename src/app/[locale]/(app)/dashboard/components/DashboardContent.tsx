"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import PageHeader from "@/src/components/PageHeader";
import StatCard from "@/src/components/StatCard";
import ToggleSwitch from "@/src/components/ToggleSwitch";
import TopServicesChart from "./TopServicesChart";
import OccupancyByProject from "./OccupancyByProject";
import ProjectsOverview from "./ProjectsOverview";
import RecentServiceRequests from "./RecentServiceRequests";
import DashboardNotice from "./DashboardNotice";
import { useDashboardPage } from "../hooks/useDashboardPage";
import type { DashboardMetrics } from "../types";
import { formatNumber, formatPercent } from "../utils";
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
  InvoiceValueIcon,
  CollectedIcon,
} from "./DashboardIcons";

/** Widget keys — the order here is the default display order. */
type WidgetKey = "kpiCards" | "srTrendChart" | "occupancyRates" | "quickMetrics" | "recentServiceRequests" | "projectsOverview";

type StatKey =
  | "totalProjects"
  | "totalUnits"
  | "activeCustomers"
  | "totalOwners"
  | "totalGuests"
  | "totalTenants"
  | "avgOccupancy"
  | "openServiceRequests"
  | "openComplaints"
  | "totalInvoiceValue"
  | "collectedInvoices";

/** The stat cards, in grid order: the figure each shows, its look, and its route. */
const statCards: {
  key: StatKey;
  value: (metrics: DashboardMetrics) => string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  href: string;
}[] = [
  { key: "totalProjects",       value: (m) => formatNumber(m.totalProjects),       icon: ProjectsIcon,        iconBg: "bg-blue-50",    iconColor: "text-blue-500",    href: "/master-data/projects" },
  { key: "totalUnits",          value: (m) => formatNumber(m.totalUnits),          icon: UnitsIcon,           iconBg: "bg-blue-50",    iconColor: "text-blue-500",    href: "/master-data/units" },
  { key: "activeCustomers",     value: (m) => formatNumber(m.activeCustomers),     icon: CustomersIcon,       iconBg: "bg-purple-50",  iconColor: "text-purple-500",  href: "/master-data/customers" },
  { key: "totalOwners",         value: (m) => formatNumber(m.totalOwners),         icon: OwnersIcon,          iconBg: "bg-purple-50",  iconColor: "text-purple-500",  href: "/master-data/unit-assignment" },
  { key: "totalGuests",         value: (m) => formatNumber(m.totalGuests),         icon: GuestsIcon,          iconBg: "bg-purple-50",  iconColor: "text-purple-500",  href: "/operations/guest-invitations" },
  { key: "totalTenants",        value: (m) => formatNumber(m.totalTenants),        icon: TenantsIcon,         iconBg: "bg-purple-50",  iconColor: "text-purple-500",  href: "/master-data/rental-management" },
  { key: "avgOccupancy",        value: (m) => formatPercent(m.avgOccupancy),       icon: OccupancyIcon,       iconBg: "bg-purple-50",  iconColor: "text-purple-500",  href: "/master-data/units" },
  { key: "openServiceRequests", value: (m) => formatNumber(m.openServiceRequests), icon: ServiceRequestsIcon, iconBg: "bg-orange-50",  iconColor: "text-orange-400",  href: "/operations/service-requests" },
  { key: "openComplaints",      value: (m) => formatNumber(m.openComplaints),      icon: ComplaintsIcon,      iconBg: "bg-orange-50",  iconColor: "text-orange-400",  href: "/operations/complaints" },
  { key: "totalInvoiceValue",   value: (m) => formatNumber(m.totalInvoicesValue),  icon: InvoiceValueIcon,    iconBg: "bg-blue-50",    iconColor: "text-blue-500",    href: "/operations/invoices-payments" },
  { key: "collectedInvoices",   value: (m) => formatNumber(m.totalCollectedValue), icon: CollectedIcon,       iconBg: "bg-emerald-50", iconColor: "text-emerald-500", href: "/operations/invoices-payments" },
];

type DashboardContentProps = {
  /** Where the browser calls the API (`browserApiBaseUrl`), or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
};

const defaultWidgetOrder: WidgetKey[] = [
  "kpiCards",
  "srTrendChart",
  "occupancyRates",
  "quickMetrics",
  "recentServiceRequests",
  "projectsOverview",
];

export default function DashboardContent({ apiBaseUrl, portalBaseUrl }: DashboardContentProps) {
  const t = useTranslations("Dashboard");
  const tSide = useTranslations("SideMenu");
  const tHeader = useTranslations("PageHeader");
  const { period, setStartDate, setEndDate, data, loading, failure, retry } = useDashboardPage({
    apiBaseUrl,
    portalBaseUrl,
  });

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

  /** Render a widget section by key. Until the API has answered, only the stat cards show (with "—"). */
  const renderWidget = (key: WidgetKey) => {
    if (!widgetVisible[key]) return null;
    if (key === "kpiCards") {
      return (
        <div key={key} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <StatCard
                key={card.key}
                value={data ? card.value(data.metrics) : "—"}
                label={t(card.key)}
                icon={<Icon className={`h-[13px] w-[13px] ${card.iconColor}`} />}
                iconBg={card.iconBg}
                href={card.href}
              />
            );
          })}
        </div>
      );
    }
    if (!data) return null;
    switch (key) {
      case "srTrendChart":
        return (
          <div key={key} className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 px-1">
            <TopServicesChart data={data.topServices} />
            {widgetVisible.occupancyRates && <OccupancyByProject data={data.occupancy} />}
          </div>
        );
      case "occupancyRates":
        // Rendered inline with srTrendChart when both visible; standalone otherwise
        if (widgetVisible.srTrendChart) return null;
        return (
          <div key={key} className="px-1">
            <OccupancyByProject data={data.occupancy} />
          </div>
        );
      case "quickMetrics":
        return (
          <div key={key} className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 px-1">
            <QuickMetrics
              title={t("widget_quickMetrics")}
              items={[{ key: "avgOccupancy", label: t("avgOccupancy"), value: data.metrics.avgOccupancy, color: "#10b981" }]}
            />
            {widgetVisible.projectsOverview && <ProjectsOverview data={data.occupancy} />}
          </div>
        );
      case "projectsOverview":
        // Rendered inline with quickMetrics when both visible; standalone otherwise
        if (widgetVisible.quickMetrics) return null;
        return (
          <div key={key} className="px-1">
            <ProjectsOverview data={data.occupancy} />
          </div>
        );
      case "recentServiceRequests":
        return (
          <div key={key} className="px-1">
            <RecentServiceRequests data={data.latestRequests} viewAllHref="/operations/service-requests" />
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
        dateFrom={period.startDate}
        dateTo={period.endDate}
        onDateFromChange={setStartDate}
        onDateToChange={setEndDate}
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

      <p className="-mt-3 px-5 text-[11px] text-gray-400">
        {period.startDate || period.endDate ? t("periodHint") : t("allTimeHint")}
      </p>

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
                    {t(`widget_${key}`)}
                  </span>
                </div>
                <ToggleSwitch
                  checked={widgetVisible[key]}
                  onChange={() => toggleWidget(key)}
                  label={t(`widget_${key}`)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {failure && (
        <div className="px-1">
          <DashboardNotice failure={failure} onRetry={retry} />
        </div>
      )}

      <div aria-busy={loading} className={`flex flex-col gap-4 transition-opacity ${loading && data ? "opacity-60" : ""}`}>
        {/* Dashboard widgets in configured order */}
        {widgetOrder.map(renderWidget)}

        {!data && loading && (
          <p role="status" className="px-5 text-[12px] text-gray-400">
            {t("loading")}
          </p>
        )}
      </div>
    </div>
  );
}

type QuickMetric = { key: string; label: string; value: number; color: string };

/** Percentages from the API as rings; only figures the API returns are shown. */
function QuickMetrics({ title, items }: { title: string; items: QuickMetric[] }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-[12px] font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center justify-around py-2">
        {items.map((m) => (
          <div key={m.key} className="flex flex-col items-center gap-2">
            <DonutRing value={m.value} color={m.color} />
            <span className="text-[10px] text-gray-400">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutRing({ value, color }: { value: number; color: string }) {
  const radius = 24;
  const stroke = 7;
  const center = radius + stroke;
  const size = center * 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.min(100, Math.max(0, value)) / 100) * circumference;
  const gap = circumference - filled;

  return (
    <div className="relative">
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        {/* Track */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        {/* Value arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${gap}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-gray-700">
        {formatPercent(value)}
      </span>
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
