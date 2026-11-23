import { z } from "zod";
import { apiGet, apiPost, apiPut, type ApiQuery } from "@/src/lib/apiClient";

/**
 * Guest invitations: a resident lets a guest into the community app for a while
 * (`/admin/customers/guest-invitations`, ability-crm-api/apps/community-admin/src/customers,
 * answers built by `formatGuestInvitation` in libs/domain/src/customers/
 * customer-shared.service.ts). Each call resolves with the adapted answer or throws:
 * `ApiError` (src/lib/apiClient.ts) when the API refuses or can't be reached,
 * `GuestInvitationsAnswerError` when an answer doesn't have the expected shape.
 */

export class GuestInvitationsAnswerError extends Error {
  constructor(route: string) {
    super(`The ${route} answer doesn't have the expected shape`);
    this.name = "GuestInvitationsAnswerError";
  }
}

function parse<S extends z.ZodType>(schema: S, result: unknown, route: string): z.infer<S> {
  const parsed = schema.safeParse(result);
  if (!parsed.success) throw new GuestInvitationsAnswerError(route);
  return parsed.data;
}

export const GUEST_INVITATIONS_PAGE_SIZE = 20;

/**
 * Where an invitation stands now (`GUEST_INVITATION_STATUSES`): `upcoming` before it starts,
 * `active` while it runs, `expired` after it, `inactive` once cancelled (whatever its dates).
 */
export const GUEST_INVITATION_STATUSES = ["upcoming", "active", "expired", "inactive"] as const;
export type GuestInvitationStatus = (typeof GUEST_INVITATION_STATUSES)[number];

const id = z.number().int();
const text = z.string().nullable();

const invitationSchema = z.object({
  id,
  status: z.enum(GUEST_INVITATION_STATUSES),
  is_active: z.number().int(),
  valid_from: z.string(),
  valid_to: z.string(),
  created_at: z.string(),
  project: z.object({ id, name: text }),
  unit: z.object({ id, unit_number: z.string() }),
  invited_by: z.object({ id, customer_name: z.string(), mobile_number: text }),
  guest: z.object({
    id,
    guest_name: text,
    mobile_number: z.string(),
    gender: text,
    email: text,
    birth_date: text,
  }),
});

const listSchema = z.object({
  total_count: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
  guest_invitations: z.array(invitationSchema),
});

export type GuestInvitation = {
  id: number;
  status: GuestInvitationStatus;
  /** Cairo time, `YYYY-MM-DD, HH:mm`. */
  validFrom: string;
  validTo: string;
  createdAt: string;
  projectId: number;
  projectName: string | null;
  unitId: number;
  unitNumber: string;
  residentId: number;
  residentName: string;
  residentMobile: string | null;
  guestName: string | null;
  guestMobile: string;
  /** `male`, `female`, or null. */
  guestGender: string | null;
  guestEmail: string | null;
  /** `YYYY-MM-DD`. */
  guestBirthDate: string | null;
};

export type GuestInvitationsPage = { invitations: GuestInvitation[]; totalCount: number; totalPages: number };

function toInvitation(invitation: z.infer<typeof invitationSchema>): GuestInvitation {
  return {
    id: invitation.id,
    status: invitation.status,
    validFrom: invitation.valid_from,
    validTo: invitation.valid_to,
    createdAt: invitation.created_at,
    projectId: invitation.project.id,
    projectName: invitation.project.name,
    unitId: invitation.unit.id,
    unitNumber: invitation.unit.unit_number,
    residentId: invitation.invited_by.id,
    residentName: invitation.invited_by.customer_name,
    residentMobile: invitation.invited_by.mobile_number,
    guestName: invitation.guest.guest_name,
    guestMobile: invitation.guest.mobile_number,
    guestGender: invitation.guest.gender,
    guestEmail: invitation.guest.email,
    guestBirthDate: invitation.guest.birth_date,
  };
}

export function toGuestInvitationsPage(result: unknown): GuestInvitationsPage {
  const data = parse(listSchema, result, "guest invitations");
  return {
    invitations: data.guest_invitations.map(toInvitation),
    totalCount: data.total_count,
    totalPages: data.total_pages,
  };
}

export function toGuestInvitation(result: unknown): GuestInvitation {
  return toInvitation(parse(invitationSchema, result, "guest invitation"));
}

// ---- GET /customers/guest-invitations

export type GuestInvitationFilters = {
  /** The guest's name or mobile, the resident's name or mobile, or the unit number. */
  search: string;
  /** Whole-value match instead of part of it. */
  exact: boolean;
  status: GuestInvitationStatus | null;
};

/** `GetGuestInvitationsDto`. */
export function guestInvitationsQuery(filters: GuestInvitationFilters): ApiQuery {
  const search = filters.search.trim();
  return {
    search,
    is_exact: search && filters.exact ? 1 : null,
    status: filters.status,
  };
}

/** One page of invitations, newest first. */
export async function fetchGuestInvitations(
  apiBaseUrl: string,
  filters: GuestInvitationFilters,
  page: number,
  locale: string,
): Promise<GuestInvitationsPage> {
  const result = await apiGet(
    apiBaseUrl,
    "/customers/guest-invitations",
    { ...guestInvitationsQuery(filters), page, limit: GUEST_INVITATIONS_PAGE_SIZE },
    { locale },
  );
  return toGuestInvitationsPage(result);
}

export type GuestInvitationCounts = { active: number; upcoming: number };

/** How many invitations run now and how many are still to start: two one-row reads. */
export async function fetchGuestInvitationCounts(apiBaseUrl: string, locale: string): Promise<GuestInvitationCounts> {
  const count = async (status: GuestInvitationStatus) =>
    toGuestInvitationsPage(
      await apiGet(apiBaseUrl, "/customers/guest-invitations", { status, page: 1, limit: 1 }, { locale }),
    ).totalCount;
  const [active, upcoming] = await Promise.all([count("active"), count("upcoming")]);
  return { active, upcoming };
}

// ---- GET /customers/guest-invitations/:id

export async function fetchGuestInvitation(
  apiBaseUrl: string,
  invitationId: number,
  locale: string,
): Promise<GuestInvitation> {
  const result = await apiGet(apiBaseUrl, `/customers/guest-invitations/${invitationId}`, {}, { locale });
  return toGuestInvitation(result);
}

// ---- POST /customers/guest-invitations

/** `CreateCustomerGuestInvitationDto`: made on a resident's behalf, for one of their units. */
export type CreateGuestInvitationBody = {
  project_id: number;
  customer_id: number;
  unit_id: number;
  guest_name: string;
  mobile_number: string;
  /** Cairo clock time, `YYYY-MM-DDTHH:mm`. */
  valid_from: string;
  valid_to: string;
  gender?: "male" | "female";
  email?: string;
  /** `YYYY-MM-DD`. */
  birth_date?: string;
};

const createdSchema = z.object({ invitation_id: id });

/** Resolves with the new invitation's id. The API also makes its QR code for the app. */
export async function createGuestInvitation(
  apiBaseUrl: string,
  body: CreateGuestInvitationBody,
  locale: string,
): Promise<number> {
  const result = await apiPost(apiBaseUrl, "/customers/guest-invitations", body, { locale });
  return parse(createdSchema, result, "create guest invitation").invitation_id;
}

// ---- PUT /customers/guest-invitations/:id

/** Cancels the invitation (`is_active: 0`) or brings it back (`1`). */
export async function setGuestInvitationActive(
  apiBaseUrl: string,
  invitationId: number,
  active: boolean,
  locale: string,
): Promise<void> {
  await apiPut(apiBaseUrl, `/customers/guest-invitations/${invitationId}`, { is_active: active ? 1 : 0 }, { locale });
}
