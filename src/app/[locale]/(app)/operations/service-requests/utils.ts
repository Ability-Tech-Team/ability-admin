import type { ServiceOption } from "@/src/services/definitions";
import { TICKET_STATUS, type NewServiceRequest } from "@/src/services/serviceRequests";
import type { Unit, UnitOwner } from "@/src/services/units";

/** The catalog key (`ServiceRequestsScreen.statuses.<key>`) for each backend ticket status. */
export const ticketStatusKeys: Record<number, string> = {
  [TICKET_STATUS.created]: "created",
  [TICKET_STATUS.paid]: "paid",
  [TICKET_STATUS.confirmed]: "confirmed",
  [TICKET_STATUS.inProgress]: "inProgress",
  [TICKET_STATUS.fulfilled]: "fulfilled",
  [TICKET_STATUS.done]: "done",
  [TICKET_STATUS.rejected]: "rejected",
};

/** Badge colours: in progress blue, rejected red, the rest green (open or finished). */
export function ticketStatusStyle(statusId: number): { border: string; text: string } {
  if (statusId === TICKET_STATUS.inProgress) return { border: "border-blue-300", text: "text-blue-600" };
  if (statusId === TICKET_STATUS.rejected) return { border: "border-red-300", text: "text-red-500" };
  return { border: "border-emerald-300", text: "text-emerald-600" };
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** A number from a `<select>` value; empty means "any". */
export function optionalId(value: string): number | null {
  const id = Number(value);
  return value && Number.isInteger(id) && id > 0 ? id : null;
}

/** A filter `<select>`, styled like the toolbar's filter buttons. */
export const filterSelectClass =
  "h-7 rounded-md border border-gray-200 bg-white px-2 text-[10.5px] text-gray-600 outline-none hover:bg-gray-50 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors";

// ---- New Request (POST /orders/tickets)

/** The New Request form as typed; the unit and its owner live in the owned-unit search. */
export type NewRequestFormValues = {
  /** Free text, sent as the ticket's notes (optional). */
  notes: string;
  departmentId: number | null;
  serviceId: number | null;
  quantity: string;
  /** Null until edited: the chosen owner's name. */
  requesterName: string | null;
  /** Null until edited: the chosen owner's mobile. */
  requesterMobile: string | null;
  /** `YYYY-MM-DD`. */
  dueDate: string;
  /** `HH:mm`. */
  dueTime: string;
};

export type NewRequestField =
  | "unit"
  | "ownerId"
  | "customer"
  | "departmentId"
  | "serviceId"
  | "quantity"
  | "requesterName"
  | "requesterMobile"
  | "dueDate"
  | "dueTime";

/** The catalog key under `ServiceRequestsScreen.create.errors`. */
export type NewRequestProblem = "required" | "mobile" | "quantity" | "past" | "noMobile";
export type NewRequestErrors = Partial<Record<NewRequestField, NewRequestProblem>>;

export function emptyNewRequestForm(): NewRequestFormValues {
  return {
    notes: "",
    departmentId: null,
    serviceId: null,
    quantity: "1",
    requesterName: null,
    requesterMobile: null,
    dueDate: "",
    dueTime: "",
  };
}

/** What the form doesn't hold itself: the picked unit and owner, and what the API listed for them. */
export type NewRequestContext = {
  unit: Unit | null;
  owner: UnitOwner | null;
  /** The owner's mobile from their customer record (`GET /customers/:id`); null when it has none. */
  ownerMobile: string | null;
  /** The chosen service as the department's list gives it (with its price); null when not among them. */
  service: ServiceOption | null;
  /** Cairo clock time now, `YYYY-MM-DD HH:mm` (`cairoNow`). */
  now: string;
};

/** The requester shown and sent: the owner's name and mobile until the user edits them. */
export function requesterOf(values: NewRequestFormValues, context: Pick<NewRequestContext, "owner" | "ownerMobile">) {
  return {
    name: values.requesterName ?? context.owner?.name ?? "",
    mobile: values.requesterMobile ?? context.ownerMobile ?? "",
  };
}

/** `CreateTicketDto` takes exactly 11 characters; the app's mobiles are 11 digits (01xxxxxxxxx). */
const MOBILE = /^\d{11}$/;

type ValidatedRequest = { ok: true; input: NewServiceRequest } | { ok: false; errors: NewRequestErrors };

/**
 * The fields `CreateTicketDto` requires, the requester mobile's length, a whole positive quantity,
 * and a due time not in the past (`createTicket` refuses one more than an hour old). The API
 * checks the rest (the unit's project, the services' department and prices) and says why it refuses.
 */
export function validateNewRequest(values: NewRequestFormValues, context: NewRequestContext): ValidatedRequest {
  const errors: NewRequestErrors = {};
  const { unit, owner, service } = context;
  const requester = requesterOf(values, context);
  const quantity = Number(values.quantity.trim());

  if (!unit) errors.unit = "required";
  else if (!owner || !unit.owners.some((candidate) => candidate.customerId === owner.customerId)) errors.ownerId = "required";
  else if (!context.ownerMobile?.trim()) errors.customer = "noMobile";
  if (values.departmentId === null) errors.departmentId = "required";
  if (values.serviceId === null || !service || service.id !== values.serviceId) errors.serviceId = "required";
  if (!values.quantity.trim()) errors.quantity = "required";
  else if (!Number.isInteger(quantity) || quantity < 1) errors.quantity = "quantity";
  if (!requester.name.trim()) errors.requesterName = "required";
  if (!requester.mobile.trim()) errors.requesterMobile = "required";
  else if (!MOBILE.test(requester.mobile.trim())) errors.requesterMobile = "mobile";
  if (!values.dueDate) errors.dueDate = "required";
  if (!values.dueTime) errors.dueTime = "required";
  const arrivalTime = `${values.dueDate} ${values.dueTime}`;
  if (values.dueDate && values.dueTime && arrivalTime < context.now) errors.dueTime = "past";

  if (Object.keys(errors).length > 0 || !unit || !owner || !service || values.departmentId === null) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    input: {
      projectId: unit.projectId,
      unitId: unit.id,
      unitNumber: unit.unitNumber,
      customerId: owner.customerId,
      customerName: owner.name,
      customerMobile: context.ownerMobile ?? "",
      departmentId: values.departmentId,
      requesterName: requester.name,
      requesterMobile: requester.mobile,
      arrivalTime,
      services: [{ serviceId: service.id, quantity, price: service.price }],
      notes: values.notes,
    },
  };
}

/** Cairo clock time, `YYYY-MM-DD HH:mm`: the API reads `arrival_time` as Cairo time. */
export function cairoNow(date: Date): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Cairo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}
