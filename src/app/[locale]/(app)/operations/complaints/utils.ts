import {
  COMPLAINT_DETAILS_MAX_LENGTH,
  COMPLAINT_REQUEST_SOURCE_CRM,
  COMPLAINT_STATUS,
  type CreateComplaintBody,
} from "@/src/services/complaints";
import type { ComplaintTypeOption, DefinitionOption } from "@/src/services/definitions";
import type { Unit, UnitOwner } from "@/src/services/units";

/** The catalog key (`ComplaintsScreen.statuses.<key>`) for each backend complaint status. */
export const complaintStatusKeys: Record<number, string> = {
  [COMPLAINT_STATUS.open]: "open",
  [COMPLAINT_STATUS.inProgress]: "inProgress",
  [COMPLAINT_STATUS.resolved]: "resolved",
  [COMPLAINT_STATUS.rejected]: "rejected",
};

/** Badge colours: in progress blue, rejected red, open and resolved green. */
export function complaintStatusStyle(statusId: number): string {
  if (statusId === COMPLAINT_STATUS.inProgress) return "border-blue-300 text-blue-600";
  if (statusId === COMPLAINT_STATUS.rejected) return "border-red-300 text-red-500";
  return "border-emerald-300 text-emerald-600";
}

/** The date of a `YYYY-MM-DD, HH:mm` value. */
export function datePart(dateTime: string): string {
  return dateTime.split(", ")[0] ?? dateTime;
}

/** A number from a `<select>` value; empty means "any". */
export function optionalId(value: string): number | null {
  const id = Number(value);
  return value && Number.isInteger(id) && id > 0 ? id : null;
}

/** A filter `<select>`, styled like the toolbar's filter buttons. */
export const filterSelectClass =
  "h-7 rounded-md border border-gray-200 bg-white px-2 text-[10.5px] text-gray-600 outline-none hover:bg-gray-50 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors";

// New Complaint

/** The New Complaint form as typed; the unit and its owner come from the shared unit search. */
export type ComplaintFormValues = {
  /** The complaint type (the design's Subject). */
  typeId: number | null;
  /** What happened (the design's Description), sent as the complaint's details. */
  details: string;
  /** Null until chosen: the open status, once the lists have loaded. */
  statusId: number | null;
  /** `YYYY-MM-DD`. */
  date: string;
};

export type ComplaintFormField = "type" | "details" | "unit" | "owner" | "status" | "date";
export type ComplaintFormProblem = "required" | "tooLong";
export type ComplaintFormErrors = Partial<Record<ComplaintFormField, ComplaintFormProblem>>;

/** A day as `YYYY-MM-DD` in the browser's own time zone (a date input's value). */
export function localDate(day: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
}

/** An empty form, dated `today`. */
export function emptyComplaintForm(today: string): ComplaintFormValues {
  return { typeId: null, details: "", statusId: null, date: today };
}

/** The status a new complaint starts in: Open when the project lists it, else the first one. */
export function defaultComplaintStatusId(statuses: DefinitionOption[]): number | null {
  if (statuses.some((status) => status.id === COMPLAINT_STATUS.open)) return COMPLAINT_STATUS.open;
  return statuses[0]?.id ?? null;
}

/** The status the form shows and sends: the one chosen, or the default. */
export function effectiveComplaintStatusId(values: ComplaintFormValues, statuses: DefinitionOption[]): number | null {
  return values.statusId ?? defaultComplaintStatusId(statuses);
}

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function isDate(value: string): boolean {
  const match = DATE.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export type ComplaintFormContext = {
  unit: Unit | null;
  owner: UnitOwner | null;
  /** The unit's project's complaint types and statuses (`GET /definitions/all-dropdowns`). */
  types: ComplaintTypeOption[];
  statuses: DefinitionOption[];
};

type NewComplaint = {
  unit: Unit;
  owner: UnitOwner;
  type: ComplaintTypeOption;
  statusId: number;
  details: string;
  date: string;
};

/**
 * `CreateComplainDto`: the unit's project (the admin API writes only to the project sent), the
 * chosen owner as the customer, and the type's department (each complaint type belongs to one).
 */
export function buildCreateComplaintBody({ unit, owner, type, statusId, details, date }: NewComplaint): CreateComplaintBody {
  return {
    project_id: unit.projectId,
    unit_id: unit.id,
    unit_number: unit.unitNumber,
    customer_id: owner.customerId,
    customer_name: owner.name,
    type_id: type.id,
    ...(type.departmentId !== null ? { department_id: type.departmentId } : {}),
    status_id: statusId,
    details: details.trim(),
    complain_date: date,
    request_from_id: COMPLAINT_REQUEST_SOURCE_CRM,
  };
}

type Validated = { ok: true; body: CreateComplaintBody } | { ok: false; errors: ComplaintFormErrors };

/**
 * Every field the DTO requires: a unit and one of its owners, a type and a status from the
 * unit's project's lists, the details (at most `COMPLAINT_DETAILS_MAX_LENGTH` characters), and
 * a valid date.
 */
export function validateComplaintForm(values: ComplaintFormValues, context: ComplaintFormContext): Validated {
  const errors: ComplaintFormErrors = {};
  const { unit, owner } = context;
  const type = context.types.find((option) => option.id === values.typeId) ?? null;
  const statusId = effectiveComplaintStatusId(values, context.statuses);
  const status = context.statuses.find((option) => option.id === statusId) ?? null;
  const details = values.details.trim();

  if (!type) errors.type = "required";
  if (!details) errors.details = "required";
  else if (details.length > COMPLAINT_DETAILS_MAX_LENGTH) errors.details = "tooLong";
  if (!unit) errors.unit = "required";
  else if (!owner || !unit.owners.some((candidate) => candidate.customerId === owner.customerId)) errors.owner = "required";
  if (!status) errors.status = "required";
  if (!isDate(values.date)) errors.date = "required";

  if (Object.keys(errors).length > 0 || !unit || !owner || !type || !status) return { ok: false, errors };
  return { ok: true, body: buildCreateComplaintBody({ unit, owner, type, statusId: status.id, details, date: values.date }) };
}
