import { z } from "zod";
import { apiGet, apiPost, type ApiQuery, type DownloadRequest } from "@/src/lib/apiClient";

/**
 * Family members: the owners' requests, from the community app, to add a relative to their
 * unit (`/admin/customers/owner-relative-requests`, ability-crm-api/apps/community-admin/src/
 * customers, answers built by `searchOwnerRelativeRequests` in libs/domain/src/customers/
 * customer-shared.service.ts). Accepting one makes the relative a customer on the unit. Each
 * call resolves with the adapted answer or throws: `ApiError` (src/lib/apiClient.ts) when the
 * API refuses or can't be reached, `FamilyMembersAnswerError` when an answer doesn't have the
 * expected shape.
 */

export class FamilyMembersAnswerError extends Error {
  constructor(route: string) {
    super(`The ${route} answer doesn't have the expected shape`);
    this.name = "FamilyMembersAnswerError";
  }
}

function parse<S extends z.ZodType>(schema: S, result: unknown, route: string): z.infer<S> {
  const parsed = schema.safeParse(result);
  if (!parsed.success) throw new FamilyMembersAnswerError(route);
  return parsed.data;
}

export const FAMILY_MEMBERS_PAGE_SIZE = 20;

/** `ownerRelativeRequestStatusEnums` (libs/core/src/common/enums/shared.enum.ts). */
export const REQUEST_STATUS_IDS = { pending: 1, approved: 2, rejected: 3 } as const;
export type RequestStatus = keyof typeof REQUEST_STATUS_IDS;

const statusById: Record<number, RequestStatus> = { 1: "pending", 2: "approved", 3: "rejected" };

const id = z.number().int();
const text = z.string().nullable();
const file = z.object({ file_path: z.string() });

/**
 * What the community app stored with the request (`RelativeRequestPayload` in
 * apps/community-api/src/relatives/relatives.service.ts). It is JSON, so every field is checked
 * as optional; `email` comes only from older requests.
 */
const payloadSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  gender: z.string().optional(),
  relation: z.string().optional(),
  identification_type: z.string().optional(),
});

const requestSchema = z.object({
  id,
  project_id: id,
  relative_identification_id: z.string(),
  reject_reason: text,
  payload: z.unknown(),
  created_at: z.string(),
  status: z.object({ id, name: text }).nullable(),
  owner: z.object({ id, customer_name: z.string(), customer_code: text, id_number: z.string() }).nullable(),
  unit: z.object({ id, unit_number: z.string() }).nullable(),
  profile_image: file.nullable(),
  national_id_image: file.nullable(),
  identification_images: z.array(file),
  action_by: text,
});

const listSchema = z.object({
  totalCount: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  requests: z.array(requestSchema),
});

export type FamilyMemberAttachment = {
  kind: "profileImage" | "nationalIdImage" | "idImage";
  /** A signed link that expires; open it soon after loading. */
  url: string;
};

export type FamilyMemberRequest = {
  id: number;
  projectId: number;
  /** The relative's first and last name as the owner typed them. */
  name: string;
  ownerId: number | null;
  ownerName: string | null;
  /** `id` for a national ID, `passport`, or null when the app sent something else. */
  idType: "id" | "passport" | null;
  idNumber: string;
  unitNumber: string | null;
  /** Free text from the app (e.g. "Son"). */
  relationship: string | null;
  mobile: string | null;
  email: string | null;
  /** Null for a status id this app doesn't know; `statusName` still says it. */
  status: RequestStatus | null;
  statusName: string | null;
  rejectReason: string | null;
  /** The employee who last answered it. */
  actionBy: string | null;
  /** `YYYY-MM-DD, HH:mm`, Cairo time. */
  createdAt: string;
  attachments: FamilyMemberAttachment[];
};

export type FamilyMembersPage = { requests: FamilyMemberRequest[]; totalCount: number; totalPages: number };

function toIdType(value: string | undefined): FamilyMemberRequest["idType"] {
  const normalized = value?.trim().toUpperCase();
  if (normalized === "NATIONAL_ID") return "id";
  if (normalized === "PASSPORT") return "passport";
  return null;
}

function toRequest(request: z.infer<typeof requestSchema>): FamilyMemberRequest {
  const parsedPayload = payloadSchema.safeParse(request.payload);
  const payload = parsedPayload.success ? parsedPayload.data : {};
  const name = [payload.first_name, payload.last_name].filter(Boolean).join(" ").trim();
  const nationalId = request.national_id_image?.file_path;
  return {
    id: request.id,
    projectId: request.project_id,
    name,
    ownerId: request.owner?.id ?? null,
    ownerName: request.owner?.customer_name ?? null,
    idType: toIdType(payload.identification_type),
    idNumber: request.relative_identification_id,
    unitNumber: request.unit?.unit_number ?? null,
    relationship: payload.relation?.trim() || null,
    mobile: payload.phone || null,
    email: payload.email || null,
    status: request.status ? (statusById[request.status.id] ?? null) : null,
    statusName: request.status?.name ?? null,
    rejectReason: request.reject_reason,
    actionBy: request.action_by,
    createdAt: request.created_at,
    attachments: [
      ...(request.profile_image ? [{ kind: "profileImage" as const, url: request.profile_image.file_path }] : []),
      ...(nationalId ? [{ kind: "nationalIdImage" as const, url: nationalId }] : []),
      // The national ID image is also the first of these; list it once.
      ...request.identification_images
        .filter((image) => image.file_path !== nationalId)
        .map((image) => ({ kind: "idImage" as const, url: image.file_path })),
    ],
  };
}

export function toFamilyMembersPage(result: unknown): FamilyMembersPage {
  const data = parse(listSchema, result, "owner relative requests");
  return { requests: data.requests.map(toRequest), totalCount: data.totalCount, totalPages: data.totalPages };
}

// ---- GET /customers/owner-relative-requests

/** Which field the search box looks in (`SearchOwnerRelativeRequestsDto`): one at a time. */
export type FamilyMemberSearchField = "unit" | "ownerMobile" | "relativeId";

export type FamilyMemberFilters = {
  search: string;
  searchField: FamilyMemberSearchField;
  status: RequestStatus | null;
  projectId: number | null;
};

/** The unit number matches part of the value; the owner's mobile and the relative's ID match it whole. */
const searchParam: Record<FamilyMemberSearchField, string> = {
  unit: "unit_number",
  ownerMobile: "mobile_number",
  relativeId: "relative_identification_id",
};

export function familyMembersQuery(filters: FamilyMemberFilters): ApiQuery {
  return {
    [searchParam[filters.searchField]]: filters.search.trim(),
    request_status_id: filters.status ? REQUEST_STATUS_IDS[filters.status] : null,
    project_id: filters.projectId,
  };
}

/** One page of requests, newest first. */
export async function fetchFamilyMembers(
  apiBaseUrl: string,
  filters: FamilyMemberFilters,
  page: number,
  locale: string,
): Promise<FamilyMembersPage> {
  const result = await apiGet(
    apiBaseUrl,
    "/customers/owner-relative-requests",
    { ...familyMembersQuery(filters), page, limit: FAMILY_MEMBERS_PAGE_SIZE },
    { locale },
  );
  return toFamilyMembersPage(result);
}

/** The matching requests as a spreadsheet (`is_excel=1`), for `useApiDownload`. */
export function familyMembersSheetRequest(filters: FamilyMemberFilters): DownloadRequest {
  return {
    path: "/customers/owner-relative-requests",
    query: { ...familyMembersQuery(filters), is_excel: 1 },
    fallbackName: "family-members.xlsx",
  };
}

// ---- POST /customers/owner-relative-requests/:id/accept | reject | revert-accept

/** Makes the relative a customer on the owner's unit. Only a pending request (else 400). */
export async function acceptFamilyMember(apiBaseUrl: string, requestId: number, locale: string): Promise<void> {
  await apiPost(apiBaseUrl, `/customers/owner-relative-requests/${requestId}/accept`, undefined, { locale });
}

/** `RejectOwnerRelativeRequestDto`: the reason is optional and the owner is told it. */
export async function rejectFamilyMember(
  apiBaseUrl: string,
  requestId: number,
  reason: string,
  locale: string,
): Promise<void> {
  const trimmed = reason.trim();
  await apiPost(
    apiBaseUrl,
    `/customers/owner-relative-requests/${requestId}/reject`,
    trimmed ? { reason: trimmed } : {},
    { locale },
  );
}

/** Takes an approval back: the relative loses the unit and the request ends as rejected. */
export async function revertFamilyMember(apiBaseUrl: string, requestId: number, locale: string): Promise<void> {
  await apiPost(apiBaseUrl, `/customers/owner-relative-requests/${requestId}/revert-accept`, undefined, { locale });
}

// ---- POST /customers/relatives (a relative added by hand)

/** `identificationTypeEnums` (libs/core/src/common/enums/shared.enum.ts). */
export const RELATIVE_ID_TYPE = { passport: 1, nationalId: 2 } as const;
export type RelativeIdType = (typeof RELATIVE_ID_TYPE)[keyof typeof RELATIVE_ID_TYPE];

export type NewRelative = {
  /** The unit's project; the admin route requires it. */
  projectId: number;
  unitId: number;
  /** An owner who holds the unit. */
  ownerId: number;
  name: string;
  idType: RelativeIdType;
  idNumber: string;
  mobile: string;
  email: string;
  relation: string;
};

/**
 * `AddRelativeDto`: empty optional text is left out (the DTO refuses empty strings). The API
 * runs the relatives sheet's checks on this one row, so a refusal carries the sheet's reason.
 */
export function buildAddRelativeBody(input: NewRelative) {
  const optional = (value: string) => value.trim() || undefined;
  return {
    project_id: input.projectId,
    unit_id: input.unitId,
    owner_id: input.ownerId,
    relative_name: input.name.trim(),
    relative_id_number: input.idNumber.trim(),
    id_type: input.idType,
    mobile_number: optional(input.mobile),
    email: optional(input.email),
    relation: optional(input.relation),
  };
}

const addedRelativeSchema = z.object({ relative_id: id });

/**
 * Links the relative to the owner's unit at once. It makes no request, so the relative doesn't
 * join this screen's list of the app's requests (Unit Assignment shows them). Resolves with the
 * relative's customer id.
 */
export async function addFamilyMember(apiBaseUrl: string, input: NewRelative, locale: string): Promise<number> {
  const result = await apiPost(apiBaseUrl, "/customers/relatives", buildAddRelativeBody(input), { locale });
  return parse(addedRelativeSchema, result, "customers/relatives").relative_id;
}
