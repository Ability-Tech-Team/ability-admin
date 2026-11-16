"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import PageHeader from "@/src/components/PageHeader";
import StatCard from "@/src/components/StatCard";
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
  totalProjects:       { icon: ProjectsIcon,        iconBg: "bg-blue-50",    iconColor: "text-blue-500",    href: "#" },
  totalUnits:          { icon: UnitsIcon,            iconBg: "bg-blue-50",    iconColor: "text-blue-500",    href: "#" },
  activeCustomers:     { icon: CustomersIcon,        iconBg: "bg-purple-50",  iconColor: "text-purple-500",  href: "#" },
  totalOwners:         { icon: OwnersIcon,           iconBg: "bg-purple-50",  iconColor: "text-purple-500",  href: "#" },
  totalGuests:         { icon: GuestsIcon,           iconBg: "bg-purple-50",  iconColor: "text-purple-500",  href: "#" },
  totalTenants:        { icon: TenantsIcon,          iconBg: "bg-purple-50",  iconColor: "text-purple-500",  href: "#" },
  avgOccupancy:        { icon: OccupancyIcon,        iconBg: "bg-purple-50",  iconColor: "text-purple-500",  href: "#" },
  openServiceRequests: { icon: ServiceRequestsIcon,  iconBg: "bg-orange-50",  iconColor: "text-orange-400",  href: "#" },
  openComplaints:      { icon: ComplaintsIcon,       iconBg: "bg-orange-50",  iconColor: "text-orange-400",  href: "#" },
  overdueInvoices:     { icon: OverdueInvoicesIcon,  iconBg: "bg-red-50",     iconColor: "text-red-500",     href: "#" },
  totalInvoiceValue:   { icon: InvoiceValueIcon,     iconBg: "bg-blue-50",    iconColor: "text-blue-500",    href: "#" },
  collectedInvoices:   { icon: CollectedIcon,        iconBg: "bg-emerald-50", iconColor: "text-emerald-500", href: "#" },
  overdueInvoiceValue: { icon: OverdueValueIcon,     iconBg: "bg-red-50",     iconColor: "text-red-500",     href: "#" },
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
  return n.toLocaleString("en-US");
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

export default function DashboardContent({
  stats,
  serviceRequests,
  occupancy,
  quickMetrics,
  projects,
  recentRequests,
}: DashboardContentProps) {
  const t = useTranslations("Dashboard");
  const tSide = useTranslations("SideMenu");
  const tHeader = useTranslations("PageHeader");

  const [dateFrom, setDateFrom] = useState(toDateString(-13));
  const [dateTo, setDateTo] = useState(toDateString(0));

  const ordered = statOrder
    .map((key) => stats.find((s) => s.key === key))
    .filter((s): s is DashboardStat => s != null);

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
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 h-9 text-[13px] font-medium text-gray-600 hover:bg-blue-50 hover:border-blue-400 transition-colors self-end"
          >
            <WidgetsIcon className="h-4 w-4 text-gray-500" />
            {tHeader("widgets")}
          </button>
        }
      />

      {/* Stat cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
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

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 px-1">
        <ServiceRequestChart data={serviceRequests} />
        <OccupancyByProject data={occupancy} />
      </div>

      {/* Quick Metrics + Projects Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 px-1">
        <QuickMetrics data={quickMetrics} />
        <ProjectsOverview data={projects} />
      </div>

      {/* Recent Service Requests */}
      <div className="px-1">
        <RecentServiceRequests data={recentRequests} viewAllHref="/service-requests" />
      </div>
    </div>
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
