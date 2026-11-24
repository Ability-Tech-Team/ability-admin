import { z } from "zod";
import { apiGet, apiPost, type ApiQuery } from "@/src/lib/apiClient";

/**
 * Complaints (`/admin/orders/complains...`, ability-crm-api/libs/domain/src/orders: controller,
 * `dtos/get-complains.dto.ts`, and `OrdersService.getComplains`, whose rows come from
 * `formatComplainRecord`; New Complaint sends `dtos/create-complain.dto.ts` to
 * `OrdersService.createComplain`). There is no route for one complaint: the list carries each one's
 * responses and log. Each call resolves with the adapted answer or throws: `ApiError` when
 * the API refuses or can't be reached, `ComplaintsAnswerError` when an answer doesn't have the
 * expected shape.
 */

export class ComplaintsAnswerError extends Error {
  constructor(route: string) {
    super(`The complaints' ${route} answer doesn't have the expected shape`);
    this.name = "ComplaintsAnswerError";
  }
}

function parse<S extends z.ZodType>(schema: S, result: unknown, route: string): z.infer<S> {
  const parsed = schema.safeParse(result);
  if (!parsed.success) throw new ComplaintsAnswerError(route);
  return parsed.data;
}

/** The backend's `complainStatusEnums` (libs/core/src/common/enums/shared.enum.ts). */
export const COMPLAINT_STATUS = {
  open: 1,
  inProgress: 2,
  resolved: 3,
  rejected: 4,
} as const;

export const COMPLAINT_STATUS_IDS = Object.values(COMPLAINT_STATUS);

/**
 * The statuses a complaint can move to: `changeComplainStatus` only moves forward (a higher
 * id). Resolving needs a response first; the API says so when there is none.
 */
export function nextComplaintStatusIds(currentStatusId: number): number[] {
  return COMPLAINT_STATUS_IDS.filter((id) => id > currentStatusId);
}

export type ComplaintFilters = {
  /** A complaint number, or part of the customer's name. */
  search: string;
  statusId: number | null;
};

/**
 * The list route has no free-text search: a number looks for that complaint
 * (`complain_id`), anything else for the customer's name (`customer_name`, contains).
 */
export function complaintFiltersQuery({ search, statusId }: ComplaintFilters): ApiQuery {
  const term = search.trim();
  const isId = /^\d{1,9}$/.test(term);
  return {
    complain_id: isId ? term : undefined,
    customer_name: term && !isId ? term : undefined,
    status_id: statusId ?? undefined,
  };
}

const name = z.string().nullish().transform((value) => value ?? null);

const complaintSchema = z.object({
  id: z.number().int(),
  title: name,
  unit_number: z.string(),
  customer_name: z.string(),
  mobile_number: name,
  details: z.string(),
  department_name: name,
  status_id: z.number().int(),
  status_name: name,
  type_name: name,
  /** The request source's name (CRM, Community App, ...). */
  request_sources: name,
  /** The employee who recorded it, if one did. */
  created_by: name,
  /** When it was recorded (the service writes `created_at` here), `YYYY-MM-DD, HH:mm`. */
  complain_date: z.string(),
  complain_responses: z.array(
    z.object({
      response_id: z.number().int(),
      response: z.string(),
      status_name: name,
      created_by: name,
      Date: z.string(),
    }),
  ),
  complain_logs: z.array(
    z.object({
      log_id: z.number().int(),
      action_name: name,
      description: name,
      created_by: name,
      Date: z.string(),
    }),
  ),
});

export type ComplaintResponse = {
  id: number;
  text: string;
  /** The complaint's status when the response was written. */
  statusName: string | null;
  author: string | null;
  at: string;
};

export type ComplaintLog = {
  id: number;
  actionName: string | null;
  /** In the request's language, e.g. "Complain status changed to Resolved by ...". */
  description: string | null;
  actor: string | null;
  at: string;
};

export type Complaint = {
  id: number;
  title: string | null;
  typeName: string | null;
  details: string;
  unitNumber: string;
  customerName: string;
  mobileNumber: string | null;
  departmentName: string | null;
  statusId: number;
  statusName: string | null;
  sourceName: string | null;
  createdBy: string | null;
  /** `YYYY-MM-DD, HH:mm`, Cairo time. */
  createdAt: string;
  /** In the order the API gives them (oldest first). */
  responses: ComplaintResponse[];
  /** Newest first. */
  logs: ComplaintLog[];
};

function toComplaint(record: z.infer<typeof complaintSchema>): Complaint {
  return {
    id: record.id,
    title: record.title,
    typeName: record.type_name,
    details: record.details,
    unitNumber: record.unit_number,
    customerName: record.customer_name,
    mobileNumber: record.mobile_number,
    departmentName: record.department_name,
    statusId: record.status_id,
    statusName: record.status_name,
    sourceName: record.request_sources,
    createdBy: record.created_by,
    createdAt: record.complain_date,
    responses: record.complain_responses.map((response) => ({
      id: response.response_id,
      text: response.response,
      statusName: response.status_name,
      author: response.created_by,
      at: response.Date,
    })),
    logs: record.complain_logs.map((log) => ({
      id: log.log_id,
      actionName: log.action_name,
      description: log.description,
      actor: log.created_by,
      at: log.Date,
    })),
  };
}

// GET /orders/complains

export type ComplaintPage = {
  complaints: Complaint[];
  totalCount: number;
  totalPages: number;
};

const complaintsSchema = z.object({
  total_count: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
  complains: z.array(complaintSchema),
});

export function toComplaintPage(result: unknown): ComplaintPage {
  const data = parse(complaintsSchema, result, "complains");
  return {
    complaints: data.complains.map(toComplaint),
    totalCount: data.total_count,
    totalPages: data.total_pages,
  };
}

export const COMPLAINTS_PAGE_SIZE = 10;

/** One page of complaints, newest first. */
export async function fetchComplaints(
  apiBaseUrl: string,
  filters: ComplaintFilters,
  page: number,
  locale: string,
): Promise<ComplaintPage> {
  const result = await apiGet(
    apiBaseUrl,
    "/orders/complains",
    { ...complaintFiltersQuery(filters), page, limit: COMPLAINTS_PAGE_SIZE },
    { locale },
  );
  return toComplaintPage(result);
}

// POST /orders/complains/:id/response

/** The DTO's limit for a response. */
export const COMPLAINT_RESPONSE_MAX_LENGTH = 1000;

export async function addComplaintResponse(
  apiBaseUrl: string,
  id: number,
  response: string,
  locale: string,
): Promise<void> {
  await apiPost(apiBaseUrl, `/orders/complains/${id}/response`, { response: response.trim() }, { locale });
}

// POST /orders/complains/:id/change-status

export async function changeComplaintStatus(
  apiBaseUrl: string,
  id: number,
  statusId: number,
  locale: string,
): Promise<void> {
  await apiPost(apiBaseUrl, `/orders/complains/${id}/change-status`, { status_id: statusId }, { locale });
}

// POST /orders/complains

/** The DTO's limit for the details (`CreateComplainDto.details`, `@Length(0, 255)`). */
export const COMPLAINT_DETAILS_MAX_LENGTH = 255;

/**
 * Where a complaint came from (`requestSourceEnums`, libs/core/src/common/enums/shared.enum.ts).
 * The column is required although the DTO marks it optional: without it the API answers
 * `FAILED_CREATE_COMPLAIN`. `COMMUNITY_ADMIN` (5) isn't seeded in `request_sources`, so a
 * complaint recorded by staff here is a CRM one, as in Ability CRM's own form.
 */
export const COMPLAINT_REQUEST_SOURCE_CRM = 1;

/**
 * `CreateComplainDto` (libs/domain/src/orders/dtos/create-complain.dto.ts). The API refuses
 * fields the DTO doesn't list, and writes to the project sent (the unit's), which the admin
 * API needs for writes.
 */
export type CreateComplaintBody = {
  project_id: number;
  unit_id: number;
  unit_number: string;
  customer_id: number;
  customer_name: string;
  type_id: number;
  department_id?: number;
  status_id: number;
  /** At most `COMPLAINT_DETAILS_MAX_LENGTH` characters. */
  details: string;
  /** `YYYY-MM-DD`. */
  complain_date: string;
  request_from_id: number;
};

const createdComplaintSchema = z.object({ complain_id: z.number().int() });

/**
 * Records a complaint for a unit's owner. Resolves with the new complaint's id, or null when
 * the answer doesn't name it: the complaint was saved either way, so that isn't a failure
 * (which could lead to a second copy being sent).
 */
export async function createComplaint(
  apiBaseUrl: string,
  body: CreateComplaintBody,
  locale: string,
): Promise<number | null> {
  const result = await apiPost(apiBaseUrl, "/orders/complains", body, { locale });
  const created = createdComplaintSchema.safeParse(result);
  return created.success ? created.data.complain_id : null;
}
