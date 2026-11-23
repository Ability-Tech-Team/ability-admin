import { z } from "zod";
import { apiGet, apiPost, type ApiQuery, type DownloadRequest } from "@/src/lib/apiClient";

/**
 * Service requests are the backend's tickets (`/admin/orders/tickets...`,
 * ability-crm-api/libs/domain/src/orders: controller, `dtos/get-tickets.dto.ts`, and
 * `OrdersService.getTickets`, whose rows come from `HelperService.formatTicket`). Each call
 * resolves with the adapted answer or throws: `ApiError` when the API refuses or can't be
 * reached, `ServiceRequestsAnswerError` when an answer doesn't have the expected shape.
 */

export class ServiceRequestsAnswerError extends Error {
  constructor(route: string) {
    super(`The service requests' ${route} answer doesn't have the expected shape`);
    this.name = "ServiceRequestsAnswerError";
  }
}

function parse<S extends z.ZodType>(schema: S, result: unknown, route: string): z.infer<S> {
  const parsed = schema.safeParse(result);
  if (!parsed.success) throw new ServiceRequestsAnswerError(route);
  return parsed.data;
}

/** The backend's `ticketStatusEnums` (libs/core/src/common/enums/shared.enum.ts). */
export const TICKET_STATUS = {
  created: 1,
  paid: 2,
  confirmed: 3,
  inProgress: 4,
  fulfilled: 5,
  done: 6,
  rejected: 7,
} as const;

export const TICKET_STATUS_IDS = Object.values(TICKET_STATUS);

/**
 * The statuses a ticket can move to: `changeTicketStatus` only moves forward (a higher id) and
 * never out of done or rejected. Rejected needs a reason.
 */
export function nextTicketStatusIds(currentStatusId: number): number[] {
  if (currentStatusId === TICKET_STATUS.done || currentStatusId === TICKET_STATUS.rejected) return [];
  return TICKET_STATUS_IDS.filter((id) => id > currentStatusId);
}

/** The list's filters; the stats above it use the same ones. */
export type ServiceRequestFilters = {
  /** Ticket id, customer, customer mobile, requester, unit, or one of the ticket's services. */
  search: string;
  /** The whole value, any case, instead of "contains". */
  exact: boolean;
  statusId: number | null;
  projectId: number | null;
};

export function serviceRequestFiltersQuery({ search, exact, statusId, projectId }: ServiceRequestFilters): ApiQuery {
  const term = search.trim();
  return {
    search: term,
    is_exact: term && exact ? 1 : undefined,
    status_id: statusId ?? undefined,
    project_id: projectId ?? undefined,
  };
}

const name = z.string().nullish().transform((value) => value ?? null);
const dateTime = z.object({ dateTime: z.string(), date: z.string(), time: z.string() });

const ticketSchema = z.object({
  ticket_id: z.number().int(),
  customer_name: z.string(),
  customer_mobile: z.string(),
  requester_name: z.string(),
  unit_number: z.string(),
  unit_type: name,
  notes: name,
  sla_status: z.number().int().nullish(),
  is_urgent: z.number().int().nullish(),
  reject_reason: name,
  ticket_total_price: z.number(),
  department_name: name,
  /** `YYYY-MM-DD, HH:mm`, Cairo time. */
  arrival_time: z.string(),
  ticket_source_name: name,
  last_status_id: z.number().int(),
  last_status_name: name,
  agent_name: name,
  request_time: dateTime,
  services: z.array(
    z.object({
      service_id: z.number().int(),
      service_name: name,
      quantity: z.number(),
      total_price: z.number(),
    }),
  ),
  logs: z.array(
    z.object({
      log_id: z.number().int(),
      ticket_status_name: name,
      log_description: name,
      created_by: name,
      created_at: dateTime,
    }),
  ),
  comments: z.array(
    z.object({
      comment_id: z.number().int(),
      comment: z.string(),
      position: name,
      created_by: name,
      created_at: dateTime,
    }),
  ),
});

export type ServiceRequestLog = {
  id: number;
  statusName: string | null;
  /** In the request's language, e.g. "Ticket status changed to Done by ...". */
  description: string | null;
  actor: string | null;
  at: string;
};

export type ServiceRequestComment = {
  id: number;
  text: string;
  author: string | null;
  position: string | null;
  at: string;
};

export type ServiceRequest = {
  id: number;
  customerName: string;
  customerMobile: string;
  requesterName: string;
  unitNumber: string;
  unitType: string | null;
  notes: string | null;
  /** The department the ticket belongs to (the backend's "type" of request). */
  departmentName: string | null;
  /** Where it was requested: CRM, Community App, ... */
  sourceName: string | null;
  statusId: number;
  statusName: string | null;
  rejectReason: string | null;
  isUrgent: boolean;
  /** Past its SLA (`sla_status` 1), as the stats' "Overdue SLA". */
  overdueSla: boolean;
  /** When the customer expects the visit, `YYYY-MM-DD` and `HH:mm`, Cairo time. */
  arrivalDate: string;
  arrivalTime: string;
  /** When it was requested, `YYYY-MM-DD, HH:mm`. */
  requestedAt: string;
  /** The employee who created it, when an employee did. */
  agentName: string | null;
  services: { id: number; name: string | null; quantity: number; totalPrice: number }[];
  /** Services plus any runner-cashier fee; no currency comes with it. */
  totalPrice: number;
  /** Newest first. */
  logs: ServiceRequestLog[];
  /** Newest first. */
  comments: ServiceRequestComment[];
};

function toServiceRequest(ticket: z.infer<typeof ticketSchema>): ServiceRequest {
  const [arrivalDate = "", arrivalTime = ""] = ticket.arrival_time.split(", ");
  return {
    id: ticket.ticket_id,
    customerName: ticket.customer_name,
    customerMobile: ticket.customer_mobile,
    requesterName: ticket.requester_name,
    unitNumber: ticket.unit_number,
    unitType: ticket.unit_type,
    notes: ticket.notes,
    departmentName: ticket.department_name,
    sourceName: ticket.ticket_source_name,
    statusId: ticket.last_status_id,
    statusName: ticket.last_status_name,
    rejectReason: ticket.reject_reason,
    isUrgent: ticket.is_urgent === 1,
    overdueSla: ticket.sla_status === 1,
    arrivalDate,
    arrivalTime,
    requestedAt: ticket.request_time.dateTime,
    agentName: ticket.agent_name,
    services: ticket.services.map((service) => ({
      id: service.service_id,
      name: service.service_name,
      quantity: service.quantity,
      totalPrice: service.total_price,
    })),
    totalPrice: ticket.ticket_total_price,
    logs: ticket.logs.map((log) => ({
      id: log.log_id,
      statusName: log.ticket_status_name,
      description: log.log_description,
      actor: log.created_by,
      at: log.created_at.dateTime,
    })),
    comments: ticket.comments.map((comment) => ({
      id: comment.comment_id,
      text: comment.comment,
      author: comment.created_by,
      position: comment.position,
      at: comment.created_at.dateTime,
    })),
  };
}

// GET /orders/tickets

export type ServiceRequestPage = {
  requests: ServiceRequest[];
  totalCount: number;
  totalPages: number;
};

// With no match the service answers `[]` instead of the paged object.
const ticketsSchema = z.union([
  z.array(z.never()),
  z.object({
    total_count: z.number().int().nonnegative(),
    total_pages: z.number().int().nonnegative(),
    tickets: z.array(ticketSchema),
  }),
]);

export function toServiceRequestPage(result: unknown): ServiceRequestPage {
  const data = parse(ticketsSchema, result, "tickets");
  if (Array.isArray(data)) return { requests: [], totalCount: 0, totalPages: 0 };
  return {
    requests: data.tickets.map(toServiceRequest),
    totalCount: data.total_count,
    totalPages: data.total_pages,
  };
}

export const SERVICE_REQUESTS_PAGE_SIZE = 10;

/** One page of tickets, newest first. */
export async function fetchServiceRequests(
  apiBaseUrl: string,
  filters: ServiceRequestFilters,
  page: number,
  locale: string,
): Promise<ServiceRequestPage> {
  const result = await apiGet(
    apiBaseUrl,
    "/orders/tickets",
    { ...serviceRequestFiltersQuery(filters), page, limit: SERVICE_REQUESTS_PAGE_SIZE },
    { locale },
  );
  return toServiceRequestPage(result);
}

/** Every ticket the filters match (not just one page), as the API's spreadsheet (`is_excel=1`). */
export function serviceRequestsSheetRequest(filters: ServiceRequestFilters): DownloadRequest {
  return {
    path: "/orders/tickets",
    query: { ...serviceRequestFiltersQuery(filters), is_excel: 1 },
    fallbackName: "service-requests.xlsx",
  };
}

// GET /orders/tickets/stats

export type ServiceRequestStats = {
  total: number;
  /** Not fulfilled, done or rejected. */
  open: number;
  inProgress: number;
  /** Open and urgent. */
  critical: number;
  /** Open and past their SLA. */
  overdueSla: number;
};

const count = z.number().int().nonnegative();
const statsSchema = z.object({
  total: count,
  open: count,
  in_progress: count,
  critical: count,
  overdue_sla: count,
});

export function toServiceRequestStats(result: unknown): ServiceRequestStats {
  const data = parse(statsSchema, result, "tickets/stats");
  return {
    total: data.total,
    open: data.open,
    inProgress: data.in_progress,
    critical: data.critical,
    overdueSla: data.overdue_sla,
  };
}

/** The counts for the list's filters (paging aside). */
export async function fetchServiceRequestStats(
  apiBaseUrl: string,
  filters: ServiceRequestFilters,
  locale: string,
): Promise<ServiceRequestStats> {
  const result = await apiGet(apiBaseUrl, "/orders/tickets/stats", serviceRequestFiltersQuery(filters), {
    locale,
  });
  return toServiceRequestStats(result);
}

// GET /orders/tickets/:id

export function toServiceRequestDetail(result: unknown): ServiceRequest {
  return toServiceRequest(parse(ticketSchema, result, "tickets/:id"));
}

export async function fetchServiceRequest(apiBaseUrl: string, id: number, locale: string): Promise<ServiceRequest> {
  const result = await apiGet(apiBaseUrl, `/orders/tickets/${id}`, {}, { locale });
  return toServiceRequestDetail(result);
}

// POST /orders/tickets/:id/comments

export async function addServiceRequestComment(
  apiBaseUrl: string,
  id: number,
  comment: string,
  locale: string,
): Promise<void> {
  await apiPost(apiBaseUrl, `/orders/tickets/${id}/comments`, { comment: comment.trim() }, { locale });
}

// POST /orders/tickets/:id/change-status

export function changeStatusBody(statusId: number, rejectReason: string) {
  return statusId === TICKET_STATUS.rejected
    ? { status_id: statusId, reject_reason: rejectReason.trim() }
    : { status_id: statusId };
}

export async function changeServiceRequestStatus(
  apiBaseUrl: string,
  id: number,
  statusId: number,
  rejectReason: string,
  locale: string,
): Promise<void> {
  await apiPost(apiBaseUrl, `/orders/tickets/${id}/change-status`, changeStatusBody(statusId, rejectReason), {
    locale,
  });
}

