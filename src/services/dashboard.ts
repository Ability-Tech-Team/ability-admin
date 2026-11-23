import { z } from "zod";
import { apiGet } from "@/src/lib/apiClient";

/**
 * The dashboard's figures (`GET /admin/dashboard/...`,
 * ability-crm-api/apps/community-admin/src/dashboard): Super Admin only. Each call resolves
 * with the adapted answer or throws: `ApiError` (src/lib/apiClient.ts) when the API refuses
 * or can't be reached, `DashboardAnswerError` when an answer doesn't have the expected shape.
 */

/**
 * Whole Cairo days (`YYYY-MM-DD`), both ends included. An empty end leaves that side open,
 * and with both empty the API covers all time. The period filters records by when they were
 * created, so a period's "Total Units" are the units added in it.
 */
export type DashboardPeriod = { startDate: string; endDate: string };

export class DashboardAnswerError extends Error {
  constructor(route: string) {
    super(`The dashboard's ${route} answer doesn't have the expected shape`);
    this.name = "DashboardAnswerError";
  }
}

function parse<S extends z.ZodType>(schema: S, result: unknown, route: string): z.infer<S> {
  const parsed = schema.safeParse(result);
  if (!parsed.success) throw new DashboardAnswerError(route);
  return parsed.data;
}

function periodQuery({ startDate, endDate }: DashboardPeriod) {
  return { start_date: startDate, end_date: endDate };
}

const count = z.number().int().nonnegative();
const amount = z.number();
const name = z.string().nullable();

// GET /dashboard/metrics

export type DashboardMetrics = {
  totalProjects: number;
  totalUnits: number;
  activeCustomers: number;
  totalOwners: number;
  totalTenants: number;
  totalGuests: number;
  /** The average of each project's occupancy (0-100), over the projects that have units. */
  avgOccupancy: number;
  openServiceRequests: number;
  /** Open and in-progress complaints. */
  openComplaints: number;
  /** Every invoice raised except voided ones. No currency comes with the amount. */
  totalInvoicesValue: number;
  /** What was paid on collected and partly collected invoices. */
  totalCollectedValue: number;
};

const metricsSchema = z.object({
  total_projects: count,
  total_units: count,
  active_customers: count,
  total_owners: count,
  total_tenants: count,
  total_guests: count,
  avg_occupancy: amount,
  open_service_requests: count,
  open_complaints: count,
  total_invoices_value: amount,
  total_collected_value: amount,
});

export function toDashboardMetrics(result: unknown): DashboardMetrics {
  const data = parse(metricsSchema, result, "metrics");
  return {
    totalProjects: data.total_projects,
    totalUnits: data.total_units,
    activeCustomers: data.active_customers,
    totalOwners: data.total_owners,
    totalTenants: data.total_tenants,
    totalGuests: data.total_guests,
    avgOccupancy: data.avg_occupancy,
    openServiceRequests: data.open_service_requests,
    openComplaints: data.open_complaints,
    totalInvoicesValue: data.total_invoices_value,
    totalCollectedValue: data.total_collected_value,
  };
}

export async function fetchDashboardMetrics(
  apiBaseUrl: string,
  period: DashboardPeriod,
  locale: string,
): Promise<DashboardMetrics> {
  const result = await apiGet(apiBaseUrl, "/dashboard/metrics", periodQuery(period), { locale });
  return toDashboardMetrics(result);
}

// GET /dashboard/top-services

export type TopService = {
  id: number;
  /** In the request's language; null when the service no longer exists. */
  name: string | null;
  totalRequests: number;
  /** One entry per month of the period, oldest first; `month` is `YYYY-MM`. */
  monthly: { month: string; requests: number }[];
};

const topServicesSchema = z.object({
  services: z.array(
    z.object({
      id: z.number().int(),
      name,
      total_requests: count,
      monthly: z.array(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/), requests: count })),
    }),
  ),
});

export function toTopServices(result: unknown): TopService[] {
  return parse(topServicesSchema, result, "top-services").services.map((service) => ({
    id: service.id,
    name: service.name,
    totalRequests: service.total_requests,
    monthly: service.monthly,
  }));
}

/** The five most requested services, month by month. Without a period, the last five months. */
export async function fetchTopServices(
  apiBaseUrl: string,
  period: DashboardPeriod,
  locale: string,
): Promise<TopService[]> {
  const result = await apiGet(apiBaseUrl, "/dashboard/top-services", periodQuery(period), {
    locale,
  });
  return toTopServices(result);
}

// GET /dashboard/occupancy

export type ProjectOccupancy = {
  id: number;
  name: string | null;
  totalUnits: number;
  occupiedUnits: number;
  /** Occupied units as a percentage of the project's units (0-100). */
  occupancy: number;
  /** Residents; one living in several units counts once. */
  residents: number;
};

const occupancySchema = z.object({
  projects: z.array(
    z.object({
      id: z.number().int(),
      name,
      total_units: count,
      occupied_units: count,
      occupancy: amount,
      customers: count,
    }),
  ),
});

export function toProjectOccupancy(result: unknown): ProjectOccupancy[] {
  return parse(occupancySchema, result, "occupancy").projects.map((project) => ({
    id: project.id,
    name: project.name,
    totalUnits: project.total_units,
    occupiedUnits: project.occupied_units,
    occupancy: project.occupancy,
    residents: project.customers,
  }));
}

/** Every active project, in the API's order. */
export async function fetchOccupancy(
  apiBaseUrl: string,
  period: DashboardPeriod,
  locale: string,
): Promise<ProjectOccupancy[]> {
  const result = await apiGet(apiBaseUrl, "/dashboard/occupancy", periodQuery(period), {
    locale,
  });
  return toProjectOccupancy(result);
}

// GET /dashboard/latest-service-requests

type Named = { id: number; name: string | null };

export type LatestServiceRequest = {
  id: number;
  project: Named;
  department: Named;
  /** `id` is the backend's ticket status (1 created ... 6 done, 7 rejected). */
  status: Named;
  unitNumber: string;
  customerName: string;
  services: (Named & { quantity: number })[];
  /** Cairo time as the API writes it, `YYYY-MM-DD, HH:mm`. */
  arrivalTime: string;
  createdAt: string;
};

const named = z.object({ id: z.number().int(), name });

const latestSchema = z.array(
  z.object({
    id: z.number().int(),
    project: named,
    department: named,
    status: named,
    unit_number: z.string(),
    customer_name: z.string(),
    services: z.array(named.extend({ quantity: z.number().int() })),
    arrival_time: z.string(),
    created_at: z.string(),
  }),
);

export function toLatestServiceRequests(result: unknown): LatestServiceRequest[] {
  return parse(latestSchema, result, "latest-service-requests").map((request) => ({
    id: request.id,
    project: request.project,
    department: request.department,
    status: request.status,
    unitNumber: request.unit_number,
    customerName: request.customer_name,
    services: request.services,
    arrivalTime: request.arrival_time,
    createdAt: request.created_at,
  }));
}

/** The five newest service requests, whatever their status; no period applies. */
export async function fetchLatestServiceRequests(
  apiBaseUrl: string,
  locale: string,
): Promise<LatestServiceRequest[]> {
  const result = await apiGet(apiBaseUrl, "/dashboard/latest-service-requests", {}, { locale });
  return toLatestServiceRequests(result);
}
