import type { DashboardMetrics } from "@/src/services/dashboard";

/**
 * The side menu's badges, from the dashboard's all-time metrics
 * (`GET /admin/dashboard/metrics`, Super Admin only). Other roles get no badges.
 */
export type SideMenuCountKey = "projects" | "units" | "customers" | "serviceRequests" | "complaints";

export type SideMenuCounts = Partial<Record<SideMenuCountKey, number>>;

export function toSideMenuCounts(metrics: DashboardMetrics): SideMenuCounts {
  return {
    projects: metrics.totalProjects,
    units: metrics.totalUnits,
    // Residents: live customers with an active unit link.
    customers: metrics.activeCustomers,
    serviceRequests: metrics.openServiceRequests,
    // Open and in-progress complaints.
    complaints: metrics.openComplaints,
  };
}

const badgeFormat = new Intl.NumberFormat("en-US");
const compactFormat = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

/** A badge's text: nothing for a missing or zero count, `1,710` up to 9,999, then `20K`, `1.2M`. */
export function formatBadge(count: number | undefined): string | null {
  if (count == null || count <= 0) return null;
  return count > 9999 ? compactFormat.format(count) : badgeFormat.format(count);
}
