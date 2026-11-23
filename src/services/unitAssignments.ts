import { z } from "zod";
import { apiGet, apiPost } from "@/src/lib/apiClient";

/**
 * Unit assignments: one row per customer owning or renting a unit, ended ones included.
 * - Lists and details: `GET /admin/projects/units/assignments[/:id]`
 *   (ability-crm-api/apps/community-admin/src/projects, built by
 *   libs/domain/src/company-projects/company-projects.service.ts), Super Admin only (403
 *   otherwise).
 * - Assigning: `POST /admin/customers/assign-unit-to-customer`
 *   (apps/community-admin/src/customers, libs/domain/src/customers/customer-shared.service.ts).
 * - Picking the customer: `GET /admin/customers`.
 *
 * Each call resolves with the adapted answer or throws: `ApiError` when the API refuses or
 * can't be reached, `UnitAssignmentsAnswerError` when an answer doesn't have the expected shape.
 */

export class UnitAssignmentsAnswerError extends Error {
  constructor(route: string) {
    super(`The ${route} answer doesn't have the expected shape`);
    this.name = "UnitAssignmentsAnswerError";
  }
}

function parse<S extends z.ZodType>(schema: S, result: unknown, route: string): z.infer<S> {
  const parsed = schema.safeParse(result);
  if (!parsed.success) throw new UnitAssignmentsAnswerError(route);
  return parsed.data;
}

/** `ownerShipTypeEnums`: the two links that make an assignment. Relatives are family members. */
export const OWNERSHIP_OWNER = 1;
export const OWNERSHIP_RENTER = 2;
export type OwnershipId = typeof OWNERSHIP_OWNER | typeof OWNERSHIP_RENTER;

type Named = { id: number; name: string };

export type AssignmentFamilyMember = {
  id: number;
  name: string;
  /** Free text from the customer's record (e.g. "Son"), or null. */
  relation: string | null;
  active: boolean;
};

export type UnitAssignment = {
  id: number;
  unit: { id: number; unitNumber: string };
  /** The name is in the request's language. */
  project: Named;
  customer: Named;
  /** Everyone owning or renting the unit now, this customer included. */
  unitCustomers: Named[];
  /** The customer's family members on this unit. */
  familyMembers: AssignmentFamilyMember[];
  /** `id` is 1 owner or 2 renter; the name is in the request's language. */
  ownership: Named;
  /** `YYYY-MM-DD`. */
  startDate: string | null;
  endDate: string | null;
  active: boolean;
};

export type UnitAssignmentDetail = UnitAssignment & {
  signDate: string | null;
  contractNumber: string | null;
  notes: string | null;
};

const activeFlag = z.union([z.literal(0), z.literal(1)]);
const customerRef = z.object({ id: z.number().int(), customer_name: z.string() });
const named = z.object({ id: z.number().int(), name: z.string() });

const assignmentSchema = z.object({
  id: z.number().int(),
  unit: z.object({ id: z.number().int(), unit_number: z.string() }),
  project: named,
  customer: customerRef,
  unit_customers: z.array(customerRef),
  family_members: z.array(
    customerRef.extend({ relation: z.string().nullable(), is_active: activeFlag }),
  ),
  ownership: named,
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  is_active: activeFlag,
});

const detailSchema = assignmentSchema.extend({
  sign_date: z.string().nullable(),
  contract_number: z.string().nullable(),
  notes: z.string().nullable(),
});

const listSchema = z.object({
  total_count: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
  assignments: z.array(assignmentSchema),
});

function toAssignmentFields(data: z.infer<typeof assignmentSchema>): UnitAssignment {
  return {
    id: data.id,
    unit: { id: data.unit.id, unitNumber: data.unit.unit_number },
    project: data.project,
    customer: { id: data.customer.id, name: data.customer.customer_name },
    unitCustomers: data.unit_customers.map((customer) => ({
      id: customer.id,
      name: customer.customer_name,
    })),
    familyMembers: data.family_members.map((member) => ({
      id: member.id,
      name: member.customer_name,
      relation: member.relation,
      active: member.is_active === 1,
    })),
    ownership: data.ownership,
    startDate: data.start_date,
    endDate: data.end_date,
    active: data.is_active === 1,
  };
}

export type UnitAssignmentsPage = {
  assignments: UnitAssignment[];
  totalCount: number;
  totalPages: number;
};

export function toUnitAssignmentsPage(result: unknown): UnitAssignmentsPage {
  const data = parse(listSchema, result, "unit assignments");
  return {
    totalCount: data.total_count,
    totalPages: data.total_pages,
    assignments: data.assignments.map(toAssignmentFields),
  };
}

export function toUnitAssignmentDetail(result: unknown): UnitAssignmentDetail {
  const data = parse(detailSchema, result, "unit assignment");
  return {
    ...toAssignmentFields(data),
    signDate: data.sign_date,
    contractNumber: data.contract_number,
    notes: data.notes,
  };
}

// GET /projects/units/assignments

/**
 * `GetUnitAssignmentsDto`. The search matches the customer's name, the unit number, or the
 * project's English or Arabic name.
 */
export type UnitAssignmentsFilter = {
  search: string;
  /** The whole value, not part of it (`is_exact`); only sent with a search. */
  exact?: boolean;
  projectId?: number;
  ownershipId?: OwnershipId;
  active?: boolean;
  page: number;
  limit: number;
};

export function unitAssignmentsQuery({
  search,
  exact,
  projectId,
  ownershipId,
  active,
  page,
  limit,
}: UnitAssignmentsFilter) {
  const term = search.trim();
  return {
    search: term,
    is_exact: term && exact ? 1 : undefined,
    project_id: projectId,
    ownership_id: ownershipId,
    is_active: active === undefined ? undefined : active ? 1 : 0,
    page,
    limit,
  };
}

export async function fetchUnitAssignments(
  apiBaseUrl: string,
  filter: UnitAssignmentsFilter,
  locale: string,
): Promise<UnitAssignmentsPage> {
  const result = await apiGet(
    apiBaseUrl,
    "/projects/units/assignments",
    unitAssignmentsQuery(filter),
    { locale },
  );
  return toUnitAssignmentsPage(result);
}

/** 404 `ASSIGNMENT_NOT_FOUND` when it is gone or belongs to a family member. */
export async function fetchUnitAssignment(
  apiBaseUrl: string,
  id: number,
  locale: string,
): Promise<UnitAssignmentDetail> {
  const result = await apiGet(apiBaseUrl, `/projects/units/assignments/${id}`, {}, { locale });
  return toUnitAssignmentDetail(result);
}

// GET /customers (to pick who gets the unit)

export type CustomerOption = {
  id: number;
  name: string;
  idNumber: string;
  mobileNumber: string | null;
};

const customersSchema = z.object({
  customers: z.array(
    z.object({
      id: z.number().int(),
      customer_name: z.string(),
      id_number: z.string(),
      mobile_number: z.string().nullable(),
    }),
  ),
});

export function toCustomerOptions(result: unknown): CustomerOption[] {
  return parse(customersSchema, result, "customers").customers.map((customer) => ({
    id: customer.id,
    name: customer.customer_name,
    idNumber: customer.id_number,
    mobileNumber: customer.mobile_number,
  }));
}

export const CUSTOMER_SEARCH_LIMIT = 10;

/** `GetCustomersDto`: customers of the project whose name contains `name`, newest first. */
export function customerSearchQuery(name: string, projectId: number) {
  return { customer_name: name.trim(), project_id: projectId, page: 1, limit: CUSTOMER_SEARCH_LIMIT };
}

export async function searchCustomers(
  apiBaseUrl: string,
  { name, projectId }: { name: string; projectId: number },
  locale: string,
): Promise<CustomerOption[]> {
  const result = await apiGet(apiBaseUrl, "/customers", customerSearchQuery(name, projectId), {
    locale,
  });
  return toCustomerOptions(result);
}

// POST /customers/assign-unit-to-customer

/** What the assign form saves. Dates are `YYYY-MM-DD`. */
export type AssignUnitInput = {
  customerId: number;
  projectId: number;
  /** The unit is found by its number inside the project (400 `UNIT_NOT_FOUND` otherwise). */
  unitNumber: string;
  ownershipId: OwnershipId;
  contractNumber: string;
  signDate: string;
  startDate: string;
  /** Empty for an ongoing assignment; a date saves it as ended. */
  endDate: string;
};

/**
 * `AssignUnitToCustomerDto`. The API decides the status from the end date (with one it saves
 * the assignment inactive, without one active), so `is_active` follows it.
 */
export function buildAssignUnitBody(input: AssignUnitInput) {
  const endDate = input.endDate.trim();
  return {
    customer_id: input.customerId,
    project_id: input.projectId,
    unit_number: input.unitNumber.trim(),
    ownership_id: input.ownershipId,
    contract_number: input.contractNumber.trim(),
    sign_date: input.signDate,
    start_date: input.startDate,
    ...(endDate && { end_date: endDate }),
    is_active: endDate ? 0 : 1,
  };
}

/** The API answers with the saved link row; only its id is read. */
const assignedSchema = z.object({ id: z.number().int() });

/**
 * Resolves with the new assignment's id. 409 `ASSIGNMENT_ALREADY_EXISTS` when the customer
 * already holds the unit or the contract number.
 */
export async function assignUnitToCustomer(
  apiBaseUrl: string,
  input: AssignUnitInput,
  locale: string,
): Promise<number> {
  const result = await apiPost(
    apiBaseUrl,
    "/customers/assign-unit-to-customer",
    buildAssignUnitBody(input),
    { locale },
  );
  return parse(assignedSchema, result, "assign-unit-to-customer").id;
}

// POST /customers/end-ownership

/** Today in Cairo, `YYYY-MM-DD`: the backend stores dates as Cairo days. */
export function cairoToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(now);
}

/** Only an owner's open assignment can be ended here; a tenant's ends through Rental Management. */
export function canEndAssignment(assignment: Pick<UnitAssignment, "active" | "ownership">): boolean {
  return assignment.active && assignment.ownership.id === OWNERSHIP_OWNER;
}

export function buildEndOwnershipBody(
  assignment: Pick<UnitAssignment, "customer" | "unit" | "project">,
  endDate: string,
) {
  return {
    customer_id: assignment.customer.id,
    unit_id: assignment.unit.id,
    project_id: assignment.project.id,
    end_date: endDate,
  };
}

const endedSchema = z.object({ ended_relatives: z.number().int().nonnegative() });

/**
 * Ends the owner's link to the unit from `endDate`; the owner's relatives on the unit lose it
 * too. Resolves with how many relatives that ended. Refusals: `OWNERSHIP_NOT_FOUND` (no open
 * ownership, e.g. ended already) and `INVALID_END_DATE` (before the assignment's start).
 */
export async function endOwnership(
  apiBaseUrl: string,
  assignment: Pick<UnitAssignment, "customer" | "unit" | "project">,
  endDate: string,
  locale: string,
): Promise<number> {
  const result = await apiPost(
    apiBaseUrl,
    "/customers/end-ownership",
    buildEndOwnershipBody(assignment, endDate),
    { locale },
  );
  return parse(endedSchema, result, "end-ownership").ended_relatives;
}
