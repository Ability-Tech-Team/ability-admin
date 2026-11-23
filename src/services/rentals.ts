import { z } from "zod";
import { apiGet, apiPost, type ApiQuery, type DownloadRequest } from "@/src/lib/apiClient";

/**
 * Rentals, as the Community Admin API serves them: `/admin/rentals/...`
 * (ability-crm-api/libs/domain/src/rentals: rentals.controller.ts, rentals.service.ts).
 *
 * - Reservations are rentals made by staff or accepted from a request: a tenant on a unit
 *   for a period, with a rental status (`rental_statuses`, ids below). Staff move them
 *   through check-in, extension, check-out, cancellation and termination.
 * - Walk-in requests come from brokers, tenants or the community app and wait to be
 *   accepted (which makes a reservation) or rejected.
 *
 * Each call resolves with the adapted answer or throws: `ApiError` (src/lib/apiClient.ts)
 * when the API refuses or can't be reached, `RentalsAnswerError` when an answer doesn't
 * have the expected shape. Amounts come back without a currency.
 */

export class RentalsAnswerError extends Error {
  constructor(route: string) {
    super(`The ${route} answer doesn't have the expected shape`);
    this.name = "RentalsAnswerError";
  }
}

function parse<S extends z.ZodType>(schema: S, result: unknown, route: string): z.infer<S> {
  const parsed = schema.safeParse(result);
  if (!parsed.success) throw new RentalsAnswerError(route);
  return parsed.data;
}

// ---- The backend's ids (libs/core/src/common/enums/shared.enum.ts) ----

/** `rentalStatusEnums`: a reservation's `rental_status_id`. */
export const RENTAL_STATUS = {
  FEES_COLLECTION_PENDING: 1,
  ACTIVE: 2,
  FINISHED: 3,
  CANCELED: 4,
  TERMINATED: 5,
} as const;

export const RENTAL_STATUS_IDS = Object.values(RENTAL_STATUS);

/** `walkInTenantStatusEnums`: a walk-in request's `rental_status_id` (its `status_id`). */
export const WALK_IN_STATUS = {
  PENDING: 1,
  ACCEPTED: 2,
  REJECTED: 3,
  UNIT_RESERVED: 4,
} as const;

export const WALK_IN_STATUS_IDS = Object.values(WALK_IN_STATUS);

/** `walkInTenantSourceEnums`: who sent a walk-in request. */
export const WALK_IN_SOURCE = {
  BROKER: 1,
  TENANT: 2,
  COMMUNITY_APP: 3,
} as const;

export const WALK_IN_SOURCE_IDS = Object.values(WALK_IN_SOURCE);

/**
 * `identificationTypeEnums` (the `id_types` lookup). The backend notes these ids follow the
 * walk-in convention and may differ in a deployment's lookup table.
 */
export const ID_TYPE = {
  PASSPORT: 1,
  NATIONAL_ID: 2,
} as const;

export type IdTypeId = (typeof ID_TYPE)[keyof typeof ID_TYPE];

/** What the API lets staff do to a reservation in each status (rentals.service.ts). */
export function reservationActions(statusId: number | null) {
  const pending = statusId === RENTAL_STATUS.FEES_COLLECTION_PENDING;
  const active = statusId === RENTAL_STATUS.ACTIVE;
  return {
    /** From the start date on; the API checks the date. */
    checkIn: pending,
    cancel: pending,
    extend: pending || active,
    /** From the end date on; the API checks the date. */
    checkOut: active,
    terminate: active,
  };
}

/** Accept and reject both take pending and unit-reserved requests. */
export function walkInActions(statusId: number | null) {
  const open = statusId === WALK_IN_STATUS.PENDING || statusId === WALK_IN_STATUS.UNIT_RESERVED;
  return { accept: open, reject: open };
}

// ---- Shared pieces ----

const decimal = z
  .union([z.number(), z.string()])
  .nullable()
  .optional()
  .transform((value) => {
    if (value === null || value === undefined || value === "") return null;
    const number = typeof value === "number" ? value : Number(value);
    return Number.isFinite(number) ? number : null;
  });

/** The API writes dates as `YYYY-MM-DD`, `""` or null when there is none. */
const dateText = z
  .string()
  .nullable()
  .optional()
  .transform((value) => (value ? value : null));

const optionalText = z
  .string()
  .nullable()
  .optional()
  .transform((value) => value ?? null);

const named = z.object({ id: z.number().int(), name: z.string().nullable().optional() }).nullable().optional();

export type Named = { id: number; name: string | null };

function toNamed(value: z.infer<typeof named>): Named | null {
  return value ? { id: value.id, name: value.name ?? null } : null;
}

export type RentalTenant = {
  name: string;
  /** In the request's language. */
  idType: Named | null;
  idNumber: string;
  mobileNumber: string | null;
  email: string | null;
};

export type RentalRelative = RentalTenant & { id: number; relation: string | null };

export type RentalAttachment = {
  id: string;
  fileName: string;
  /** A short-lived signed link (the API's MediaUrlInterceptor). */
  url: string;
  description: string | null;
  /** Whose document it is. */
  ownerName: string | null;
};

const attachmentSchema = z.object({
  id: z.string(),
  file_name: z.string(),
  file_path: z.string(),
  description: optionalText,
  customer_name: optionalText,
});

function toAttachment(media: z.infer<typeof attachmentSchema>): RentalAttachment {
  return {
    id: media.id,
    fileName: media.file_name,
    url: media.file_path,
    description: media.description || null,
    ownerName: media.customer_name,
  };
}

const pageTotals = {
  total_count: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
};

export type Page<T> = { items: T[]; totalCount: number; totalPages: number };

export type SearchField = "customer_name" | "unit_number" | "id_number" | "mobile_number";

/** The fields a reservation search can match, one at a time (`SearchReservationsDto`). */
export const RESERVATION_SEARCH_FIELDS: readonly SearchField[] = [
  "customer_name",
  "unit_number",
  "id_number",
  "mobile_number",
];

/** `SearchWalkInRentalRequestsDto` has no mobile number. */
export const WALK_IN_SEARCH_FIELDS: readonly SearchField[] = ["customer_name", "unit_number", "id_number"];

// ---- GET /rentals/reservations ----

export type ReservationFilter = {
  searchField: SearchField;
  /** Tenant name and unit number match a part; ID and mobile numbers match exactly. */
  search: string;
  projectId: number | null;
  statusId: number | null;
};

export type ReservationListItem = {
  id: number;
  unitNumber: string;
  tenantName: string;
  mobileNumber: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string | null;
  statusId: number | null;
  /** In the request's language. */
  statusName: string | null;
  /** Where the reservation came from (CRM, Community App ...), in the request's language. */
  sourceName: string | null;
};

const reservationListSchema = z.object({
  ...pageTotals,
  reservations: z.array(
    z.object({
      id: z.number().int(),
      unit_number: z.string(),
      created_at: dateText,
      start_date: dateText,
      end_date: dateText,
      tenant_name: z.string(),
      mobile_number: optionalText,
      rental_status_id: z.number().int().nullable(),
      rental_status_name: optionalText,
      request_source_name: optionalText,
    }),
  ),
});

export function toReservationsPage(result: unknown): Page<ReservationListItem> {
  const data = parse(reservationListSchema, result, "rentals/reservations");
  return {
    totalCount: data.total_count,
    totalPages: data.total_pages,
    items: data.reservations.map((reservation) => ({
      id: reservation.id,
      unitNumber: reservation.unit_number,
      tenantName: reservation.tenant_name,
      mobileNumber: reservation.mobile_number,
      startDate: reservation.start_date,
      endDate: reservation.end_date,
      createdAt: reservation.created_at,
      statusId: reservation.rental_status_id,
      statusName: reservation.rental_status_name,
      sourceName: reservation.request_source_name,
    })),
  };
}

export function reservationsQuery(filter: ReservationFilter): ApiQuery {
  const search = filter.search.trim();
  return {
    ...(search && { [filter.searchField]: search }),
    project_id: filter.projectId ?? undefined,
    rental_status: filter.statusId ?? undefined,
  };
}

export async function fetchReservations(
  apiBaseUrl: string,
  filter: ReservationFilter,
  page: number,
  limit: number,
  locale: string,
): Promise<Page<ReservationListItem>> {
  const result = await apiGet(
    apiBaseUrl,
    "/rentals/reservations",
    { ...reservationsQuery(filter), page, limit },
    { locale },
  );
  return toReservationsPage(result);
}

/** The filtered reservations as an Excel sheet (`is_excel=1`), for `useApiDownload`. */
export function reservationsSheetRequest(filter: ReservationFilter): DownloadRequest {
  return {
    path: "/rentals/reservations",
    query: { ...reservationsQuery(filter), is_excel: 1 },
    fallbackName: "reservations.xlsx",
  };
}

// ---- GET /rentals/reservations/:id ----

export type ReservationDetail = {
  id: number;
  unitNumber: string;
  unitId: number;
  projectId: number;
  projectName: string | null;
  startDate: string | null;
  signDate: string | null;
  endDate: string | null;
  statusId: number | null;
  statusName: string | null;
  accessCardNumber: string | null;
  notes: string | null;
  totalTenantCount: number | null;
  rentalCompanyName: string | null;
  /** 1-5, given at check-out. */
  tenantRating: number | null;
  terminationReason: string | null;
  penaltyAmount: number | null;
  sourceName: string | null;
  tenant: RentalTenant;
  relatives: RentalRelative[];
  attachments: RentalAttachment[];
};

const tenantFields = {
  customer_name: z.string(),
  id_number: z.string(),
  mobile_number: optionalText,
  email: optionalText,
};

const reservationDetailSchema = z.object({
  reservation: z.object({
    id: z.number().int(),
    unit_number: z.string(),
    unit_id: z.number().int(),
    project_id: z.number().int(),
    project_name: optionalText,
    start_date: dateText,
    sign_date: dateText,
    end_date: dateText,
    rental_status_id: z.number().int().nullable(),
    rental_status_name: optionalText,
    access_card_number: optionalText,
    notes: optionalText,
    total_tenant_count: z.number().int().nullable().optional(),
    rental_company_name: optionalText,
    tenant_rating: z.number().int().nullable().optional(),
    termination_reason: optionalText,
    penalty_amount: decimal,
    from_app: named,
  }),
  tenant: z.object({ ...tenantFields, id_type: named }),
  relatives: z.array(
    z.object({ ...tenantFields, id: z.number().int(), relative_relation: optionalText }),
  ),
  media: z.array(attachmentSchema),
});

export function toReservationDetail(result: unknown): ReservationDetail {
  const data = parse(reservationDetailSchema, result, "rentals/reservations/:id");
  const { reservation, tenant } = data;
  return {
    id: reservation.id,
    unitNumber: reservation.unit_number,
    unitId: reservation.unit_id,
    projectId: reservation.project_id,
    projectName: reservation.project_name,
    startDate: reservation.start_date,
    signDate: reservation.sign_date,
    endDate: reservation.end_date,
    statusId: reservation.rental_status_id,
    statusName: reservation.rental_status_name,
    accessCardNumber: reservation.access_card_number,
    notes: reservation.notes,
    totalTenantCount: reservation.total_tenant_count ?? null,
    rentalCompanyName: reservation.rental_company_name,
    tenantRating: reservation.tenant_rating ?? null,
    terminationReason: reservation.termination_reason,
    penaltyAmount: reservation.penalty_amount,
    sourceName: toNamed(reservation.from_app)?.name ?? null,
    tenant: {
      name: tenant.customer_name,
      idType: toNamed(tenant.id_type),
      idNumber: tenant.id_number,
      mobileNumber: tenant.mobile_number,
      email: tenant.email,
    },
    // The reservation answer gives relatives no id type.
    relatives: data.relatives.map((relative) => ({
      id: relative.id,
      name: relative.customer_name,
      idType: null,
      idNumber: relative.id_number,
      mobileNumber: relative.mobile_number,
      email: relative.email,
      relation: relative.relative_relation,
    })),
    attachments: data.media.map(toAttachment),
  };
}

export async function fetchReservation(
  apiBaseUrl: string,
  id: number,
  locale: string,
): Promise<ReservationDetail> {
  const result = await apiGet(apiBaseUrl, `/rentals/reservations/${id}`, {}, { locale });
  return toReservationDetail(result);
}

// ---- Reservation actions (POST /rentals/reservations/:id/...) ----

export type CheckOutInput = { tenantRating: number; penaltyAmount: number | null };
export type TerminateInput = { reason: string; penaltyAmount: number | null };

/** `CheckOutDto`: `tenant_rating` 1-5, `penalty_amount` optional. */
export function checkOutBody({ tenantRating, penaltyAmount }: CheckOutInput) {
  return { tenant_rating: tenantRating, ...(penaltyAmount !== null && { penalty_amount: penaltyAmount }) };
}

/** `TerminateRentDto`: `termination_reason`, `penalty_amount` optional. */
export function terminateBody({ reason, penaltyAmount }: TerminateInput) {
  return {
    termination_reason: reason.trim(),
    ...(penaltyAmount !== null && { penalty_amount: penaltyAmount }),
  };
}

export async function checkInReservation(apiBaseUrl: string, id: number, locale: string) {
  await apiPost(apiBaseUrl, `/rentals/reservations/${id}/check-in`, undefined, { locale });
}

export async function checkOutReservation(
  apiBaseUrl: string,
  id: number,
  input: CheckOutInput,
  locale: string,
) {
  await apiPost(apiBaseUrl, `/rentals/reservations/${id}/check-out`, checkOutBody(input), { locale });
}

/** `ExtendRentDto`: a later `new_end_date` (`YYYY-MM-DD`). */
export async function extendReservation(
  apiBaseUrl: string,
  id: number,
  newEndDate: string,
  locale: string,
) {
  await apiPost(apiBaseUrl, `/rentals/reservations/${id}/extend`, { new_end_date: newEndDate }, { locale });
}

export async function cancelReservation(apiBaseUrl: string, id: number, locale: string) {
  await apiPost(apiBaseUrl, `/rentals/reservations/${id}/cancel`, undefined, { locale });
}

export async function terminateReservation(
  apiBaseUrl: string,
  id: number,
  input: TerminateInput,
  locale: string,
) {
  await apiPost(apiBaseUrl, `/rentals/reservations/${id}/terminate`, terminateBody(input), { locale });
}

// ---- GET /rentals/units (the units a new rental can take) ----

export type RentableUnitOwner = {
  id: number;
  name: string;
  code: string | null;
  mobileNumber: string | null;
  email: string | null;
  idNumber: string;
};

/** A unit that can be rented now: active, not locked, eligible for rent, with an active owner and no live rental. */
export type RentableUnit = {
  id: number;
  unitNumber: string;
  projectId: number;
  /** In the request's language. */
  projectName: string | null;
  /** In the request's language. */
  unitTypeName: string | null;
  floor: number | null;
  address: string | null;
  isActive: boolean;
  isFurnished: boolean;
  /** The company that rents the unit out; a rental needs one. */
  rentalCompanyId: number | null;
  owner: RentableUnitOwner | null;
  /** Live legal or finance blocks on the unit. */
  activeBlocks: number;
};

export type RentableUnitsPage = { units: RentableUnit[]; totalCount: number; totalPages: number };

const rentableUnitSchema = z.object({
  id: z.number().int(),
  unit_number: z.string(),
  project_id: z.number().int(),
  project_name: z.string().nullable().optional(),
  is_active: z.number().int(),
  rental_company_id: z.number().int().nullable().optional(),
  owner: z
    .object({
      id: z.number().int(),
      customer_name: z.string(),
      customer_code: z.string().nullable().optional(),
      mobile_number: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
      id_number: z.string(),
    })
    .nullable(),
  active_unit_blocks: z.array(z.unknown()).nullable().optional(),
  unit_specifications: z.object({
    floor: z.number().int().nullable().optional(),
    address: z.string().nullable().optional(),
    is_furnished: z.number().int().nullable().optional(),
    unit_type_name: z.string().nullable().optional(),
  }),
});

const rentableUnitsPageSchema = z.union([
  // No unit matches: the service answers an empty array instead of a page.
  z.array(z.never()).length(0),
  z.object({
    total_count: z.number().int().nonnegative(),
    total_pages: z.number().int().nonnegative(),
    units: z.array(rentableUnitSchema),
  }),
]);

export function toRentableUnitsPage(result: unknown): RentableUnitsPage {
  const data = parse(rentableUnitsPageSchema, result, "rentals/units");
  if (Array.isArray(data)) return { units: [], totalCount: 0, totalPages: 0 };
  return {
    totalCount: data.total_count,
    totalPages: data.total_pages,
    units: data.units.map((unit) => ({
      id: unit.id,
      unitNumber: unit.unit_number,
      projectId: unit.project_id,
      projectName: unit.project_name ?? null,
      unitTypeName: unit.unit_specifications.unit_type_name ?? null,
      floor: unit.unit_specifications.floor ?? null,
      address: unit.unit_specifications.address ?? null,
      isActive: unit.is_active === 1,
      isFurnished: unit.unit_specifications.is_furnished === 1,
      rentalCompanyId: unit.rental_company_id ?? null,
      owner: unit.owner
        ? {
            id: unit.owner.id,
            name: unit.owner.customer_name,
            code: unit.owner.customer_code ?? null,
            mobileNumber: unit.owner.mobile_number ?? null,
            email: unit.owner.email ?? null,
            idNumber: unit.owner.id_number,
          }
        : null,
      activeBlocks: unit.active_unit_blocks?.length ?? 0,
    })),
  };
}

/** The project's rentable units, in the API's order (`GetUnitsDto` declares `page` and `limit`). */
export async function fetchRentableUnits(
  apiBaseUrl: string,
  projectId: number | null,
  page: number,
  limit: number,
  locale: string,
): Promise<RentableUnitsPage> {
  const result = await apiGet(apiBaseUrl, "/rentals/units", { project_id: projectId ?? undefined, page, limit }, { locale });
  return toRentableUnitsPage(result);
}

// ---- POST /rentals/tenants (a new reservation) ----

export type NewRentalInput = {
  projectId: number;
  unitId: number;
  unitNumber: string;
  /** The unit's rental company; the API requires one. */
  rentalCompanyId: number;
  customerName: string;
  idType: IdTypeId;
  idNumber: string;
  /** Empty: none. */
  mobileNumber: string;
  startDate: string;
  endDate: string;
  /** Sent as `tenant_files`, the main tenant's documents. */
  files: readonly File[];
};

/**
 * The multipart body `CreateRentalTenantDto` accepts (AnyFilesInterceptor). One tenant and no
 * relatives, so `total_tenant_count` is 1 (the API checks it against the relatives).
 */
export function buildNewRentalForm(input: NewRentalInput): FormData {
  const form = new FormData();
  form.append("project_id", String(input.projectId));
  form.append("unit_id", String(input.unitId));
  form.append("unit_number", input.unitNumber);
  form.append("rental_company_id", String(input.rentalCompanyId));
  form.append("customer_name", input.customerName.trim());
  form.append("id_type", String(input.idType));
  form.append("id_number", input.idNumber.trim());
  const mobile = input.mobileNumber.trim();
  if (mobile) form.append("mobile_number", mobile);
  form.append("start_date", input.startDate);
  form.append("end_date", input.endDate);
  form.append("total_tenant_count", "1");
  for (const file of input.files) form.append("tenant_files", file);
  return form;
}

export async function createRental(apiBaseUrl: string, input: NewRentalInput, locale: string) {
  await apiPost(apiBaseUrl, "/rentals/tenants", buildNewRentalForm(input), { locale });
}

// ---- GET /rentals/walk-in-requests ----

export type WalkInFilter = {
  searchField: SearchField;
  search: string;
  projectId: number | null;
  statusId: number | null;
  sourceId: number | null;
};

export type WalkInListItem = {
  id: number;
  unitNumber: string | null;
  projectName: string | null;
  tenantName: string;
  idNumber: string;
  mobileNumber: string | null;
  startDate: string | null;
  endDate: string | null;
  statusId: number;
  statusName: string | null;
  sourceId: number;
  sourceName: string | null;
  rejectReason: string | null;
};

const walkInListSchema = z.object({
  ...pageTotals,
  reservations: z.array(
    z.object({
      id: z.number().int(),
      unit_number: optionalText,
      project_name: optionalText,
      start_date: dateText,
      end_date: dateText,
      tenant_name: z.string(),
      mobile_number: optionalText,
      rental_status_id: z.number().int(),
      rental_status_name: optionalText,
      id_number: z.string(),
      reject_reason: optionalText,
      source_id: z.number().int(),
      source_name: optionalText,
    }),
  ),
});

export function toWalkInPage(result: unknown): Page<WalkInListItem> {
  const data = parse(walkInListSchema, result, "rentals/walk-in-requests");
  return {
    totalCount: data.total_count,
    totalPages: data.total_pages,
    items: data.reservations.map((request) => ({
      id: request.id,
      unitNumber: request.unit_number,
      projectName: request.project_name,
      tenantName: request.tenant_name,
      idNumber: request.id_number,
      mobileNumber: request.mobile_number,
      startDate: request.start_date,
      endDate: request.end_date,
      statusId: request.rental_status_id,
      statusName: request.rental_status_name,
      sourceId: request.source_id,
      sourceName: request.source_name,
      rejectReason: request.reject_reason,
    })),
  };
}

export function walkInQuery(filter: WalkInFilter): ApiQuery {
  const search = filter.search.trim();
  // The DTO has no mobile number: sending one would be refused (400).
  const searchable = WALK_IN_SEARCH_FIELDS.includes(filter.searchField);
  return {
    ...(search && searchable && { [filter.searchField]: search }),
    project_id: filter.projectId ?? undefined,
    rental_status: filter.statusId ?? undefined,
    source: filter.sourceId ?? undefined,
  };
}

export async function fetchWalkInRequests(
  apiBaseUrl: string,
  filter: WalkInFilter,
  page: number,
  limit: number,
  locale: string,
): Promise<Page<WalkInListItem>> {
  const result = await apiGet(
    apiBaseUrl,
    "/rentals/walk-in-requests",
    { ...walkInQuery(filter), page, limit },
    { locale },
  );
  return toWalkInPage(result);
}

// ---- GET /rentals/walk-in-requests/:id ----

export type WalkInDetail = {
  id: number;
  unitNumber: string | null;
  projectName: string | null;
  startDate: string | null;
  endDate: string | null;
  statusId: number;
  statusName: string | null;
  rejectReason: string | null;
  accessCardNumber: string | null;
  notes: string | null;
  totalTenantCount: number | null;
  rentalCompanyName: string | null;
  sourceName: string | null;
  delegate: { name: string | null; nationalId: string | null; phoneNumber: string | null } | null;
  tenant: RentalTenant;
  relatives: RentalRelative[];
  attachments: RentalAttachment[];
};

const walkInDetailSchema = z.object({
  reservation: z.object({
    id: z.number().int(),
    unit_number: optionalText,
    project_name: optionalText,
    start_date: dateText,
    end_date: dateText,
    rental_status_id: z.number().int(),
    rental_status_name: optionalText,
    reject_reason: optionalText,
    access_card_number: optionalText,
    notes: optionalText,
    total_tenant_count: z.number().int().nullable().optional(),
    rental_company_name: optionalText,
    source_name: optionalText,
    delegate: z
      .object({ name: optionalText, national_id: optionalText, phone_number: optionalText })
      .nullable()
      .optional(),
  }),
  tenant: z.object({ ...tenantFields, id_type: named }),
  relatives: z.array(
    z.object({ ...tenantFields, id: z.number().int(), id_type: named, relative_relation: optionalText }),
  ),
  media: z.array(attachmentSchema),
});

export function toWalkInDetail(result: unknown): WalkInDetail {
  const data = parse(walkInDetailSchema, result, "rentals/walk-in-requests/:id");
  const { reservation, tenant } = data;
  return {
    id: reservation.id,
    unitNumber: reservation.unit_number,
    projectName: reservation.project_name,
    startDate: reservation.start_date,
    endDate: reservation.end_date,
    statusId: reservation.rental_status_id,
    statusName: reservation.rental_status_name,
    rejectReason: reservation.reject_reason,
    accessCardNumber: reservation.access_card_number,
    notes: reservation.notes,
    totalTenantCount: reservation.total_tenant_count ?? null,
    rentalCompanyName: reservation.rental_company_name,
    sourceName: reservation.source_name,
    delegate: reservation.delegate
      ? {
          name: reservation.delegate.name,
          nationalId: reservation.delegate.national_id,
          phoneNumber: reservation.delegate.phone_number,
        }
      : null,
    tenant: {
      name: tenant.customer_name,
      idType: toNamed(tenant.id_type),
      idNumber: tenant.id_number,
      mobileNumber: tenant.mobile_number,
      email: tenant.email,
    },
    relatives: data.relatives.map((relative) => ({
      id: relative.id,
      name: relative.customer_name,
      idType: toNamed(relative.id_type),
      idNumber: relative.id_number,
      mobileNumber: relative.mobile_number,
      email: relative.email,
      relation: relative.relative_relation,
    })),
    attachments: data.media.map(toAttachment),
  };
}

export async function fetchWalkInRequest(
  apiBaseUrl: string,
  id: number,
  locale: string,
): Promise<WalkInDetail> {
  const result = await apiGet(apiBaseUrl, `/rentals/walk-in-requests/${id}`, {}, { locale });
  return toWalkInDetail(result);
}

// ---- POST /rentals/walk-in-requests/:id/accept | reject ----

/** Accepting makes the request a reservation on its unit. */
export async function acceptWalkInRequest(apiBaseUrl: string, id: number, locale: string) {
  await apiPost(apiBaseUrl, `/rentals/walk-in-requests/${id}/accept`, undefined, { locale });
}

/** `RejectWalkInRequestDto`: a non-empty `reason`. */
export async function rejectWalkInRequest(
  apiBaseUrl: string,
  id: number,
  reason: string,
  locale: string,
) {
  await apiPost(apiBaseUrl, `/rentals/walk-in-requests/${id}/reject`, { reason: reason.trim() }, { locale });
}
