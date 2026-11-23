import type {
  DashboardMetrics,
  LatestServiceRequest,
  ProjectOccupancy,
  TopService,
} from "@/src/services/dashboard";

export type {
  DashboardMetrics,
  DashboardPeriod,
  LatestServiceRequest,
  ProjectOccupancy,
  TopService,
} from "@/src/services/dashboard";

export type DashboardData = {
  metrics: DashboardMetrics;
  topServices: TopService[];
  occupancy: ProjectOccupancy[];
  latestRequests: LatestServiceRequest[];
};

export type DashboardFailure =
  | { reason: "sessionEnded"; signInUrl?: string }
  | { reason: "forbidden" | "unreachable" | "failed" | "noApi" | "invalidPeriod" };
