/** A single stat returned by the dashboard API. */
export type DashboardStat = {
  key: string;
  value: number;
  /** Display prefix (e.g. "EGP"). */
  prefix?: string;
  /** Display suffix (e.g. "%"). */
  suffix?: string;
  /** Change from previous period — positive = up, negative = down. */
  change?: number;
};

export type ServiceRequestMonth = {
  month: string;
  open: number;
  resolved: number;
};

export type ProjectOccupancy = {
  name: string;
  percentage: number;
};

export type QuickMetric = {
  key: string;
  value: number;
  color: string;
};

export type DashboardProject = {
  name: string;
  status: "active" | "inactive";
  units: number;
  residents: number;
  location: string;
  occupancy: number;
};

export type RecentServiceRequest = {
  requestId: string;
  title: string;
  project: string;
  customer: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "open" | "in progress" | "resolved" | "pending";
  sla: string;
};

// TODO: replace with real API calls

export async function fetchDashboardStats(): Promise<DashboardStat[]> {
  return [
    { key: "totalProjects",       value: 5,       change: 0 },
    { key: "totalUnits",          value: 1710,    change: 12 },
    { key: "activeCustomers",     value: 1470,    change: 28 },
    { key: "totalOwners",         value: 684,     change: 14 },
    { key: "totalGuests",         value: 236,     change: 19 },
    { key: "totalTenants",        value: 786,     change: 14 },
    { key: "avgOccupancy",        value: 86,      suffix: "%",  change: -2 },
    { key: "openServiceRequests", value: 47,      change: -8 },
    { key: "openComplaints",      value: 19,      change: 3 },
    { key: "overdueInvoices",     value: 23,      change: -4 },
    { key: "totalInvoiceValue",   value: 243000,  prefix: "EGP" },
    { key: "collectedInvoices",   value: 125000,  prefix: "EGP" },
    { key: "overdueInvoiceValue", value: 100000,  prefix: "EGP" },
  ];
}

export async function fetchServiceRequestTrend(): Promise<ServiceRequestMonth[]> {
  return [
    { month: "Jun", open: 30, resolved: 35 },
    { month: "Jul", open: 25, resolved: 40 },
    { month: "Aug", open: 20, resolved: 22 },
    { month: "Sep", open: 28, resolved: 45 },
    { month: "Oct", open: 22, resolved: 35 },
    { month: "Nov", open: 25, resolved: 42 },
  ];
}

export async function fetchOccupancyByProject(): Promise<ProjectOccupancy[]> {
  return [
    { name: "Corniche", percentage: 90 },
    { name: "Marina", percentage: 89 },
    { name: "Palm", percentage: 88 },
    { name: "Downtown", percentage: 86 },
    { name: "Business Bay", percentage: 72 },
  ];
}

export async function fetchQuickMetrics(): Promise<QuickMetric[]> {
  return [
    { key: "avgOccupancyShort", value: 86, color: "#10b981" },
    { key: "srResolved", value: 68, color: "#3b82f6" },
    { key: "slaMet", value: 47, color: "#f59e0b" },
  ];
}

export async function fetchProjectsOverview(): Promise<DashboardProject[]> {
  return [
    { name: "Marina Heights", status: "active", units: 320, residents: 285, location: "Dubai Marina", occupancy: 89 },
    { name: "Palm Residences", status: "active", units: 450, residents: 398, location: "Palm Jumeirah", occupancy: 88 },
    { name: "Corniche Gardens", status: "active", units: 180, residents: 162, location: "Abu Dhabi Corniche", occupancy: 90 },
    { name: "Downtown Towers", status: "active", units: 560, residents: 480, location: "Downtown Dubai", occupancy: 86 },
  ];
}

export async function fetchRecentServiceRequests(): Promise<RecentServiceRequest[]> {
  return [
    { requestId: "SR-2024-0891", title: "AC unit not cooling", project: "Marina Heights", customer: "Ahmed Al Rashidi", priority: "High", status: "in progress", sla: "2024-12-01" },
    { requestId: "SR-2024-0890", title: "Water heater replacement", project: "Palm Residences", customer: "James Mitchell", priority: "Medium", status: "open", sla: "2024-12-02" },
    { requestId: "SR-2024-0889", title: "Parking access card issue", project: "Corniche Gardens", customer: "Mohammed Al Zaabi", priority: "Low", status: "resolved", sla: "2024-11-28" },
    { requestId: "SR-2024-0888", title: "Elevator malfunction - Tower B", project: "Marina Heights", customer: "Building Management", priority: "Critical", status: "in progress", sla: "2024-11-29" },
    { requestId: "SR-2024-0887", title: "Light fixture replacement", project: "Downtown Towers", customer: "Priya Sharma", priority: "Low", status: "pending", sla: "2024-12-03" },
  ];
}
