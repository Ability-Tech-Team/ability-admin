import {
  OWNERSHIP_OWNER,
  OWNERSHIP_RENTER,
  type AssignUnitInput,
  type OwnershipId,
} from "@/src/services/unitAssignments";
import type { AssignFormErrors, AssignFormValues } from "./types";

/** One of the two ticked filters by it; none or both list every assignment. */
export function activeFromStatusFilter(selected: ReadonlySet<string>): boolean | undefined {
  const active = selected.has("active");
  const inactive = selected.has("inactive");
  return active === inactive ? undefined : active;
}

/** The Occupancy Type filter ("owner", "tenant") as the API's `ownership_id`. */
export function ownershipFromFilter(selected: ReadonlySet<string>): OwnershipId | undefined {
  const owner = selected.has("owner");
  const tenant = selected.has("tenant");
  if (owner === tenant) return undefined;
  return owner ? OWNERSHIP_OWNER : OWNERSHIP_RENTER;
}

/** Up to two letters for a name's avatar. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

/** Everyone else holding the unit, for the "+N" beside the customer. */
export function otherHolderCount(customerId: number, unitCustomers: readonly { id: number }[]): number {
  return unitCustomers.filter((holder) => holder.id !== customerId).length;
}

export function emptyAssignForm(projectId: string, today: string): AssignFormValues {
  return {
    projectId,
    unitNumber: "",
    customer: null,
    ownershipId: OWNERSHIP_OWNER,
    contractNumber: "",
    signDate: today,
    startDate: today,
    endDate: "",
  };
}

/** Today in the browser's time zone, `YYYY-MM-DD`. */
export function todayIso(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

type Validated = { ok: true; input: AssignUnitInput } | { ok: false; errors: AssignFormErrors };

/** `AssignUnitToCustomerDto`'s required fields, and an end no earlier than the start. */
export function validateAssignForm(values: AssignFormValues): Validated {
  const errors: AssignFormErrors = {};
  const projectId = Number(values.projectId);
  if (!values.projectId || !Number.isInteger(projectId)) errors.projectId = "required";
  if (!values.unitNumber.trim()) errors.unitNumber = "required";
  if (!values.customer) errors.customer = "required";
  if (!values.contractNumber.trim()) errors.contractNumber = "required";
  if (!values.signDate) errors.signDate = "required";
  if (!values.startDate) errors.startDate = "required";
  if (values.endDate && values.startDate && values.endDate < values.startDate) {
    errors.endDate = "endBeforeStart";
  }
  if (Object.keys(errors).length > 0 || !values.customer) return { ok: false, errors };
  return {
    ok: true,
    input: {
      customerId: values.customer.id,
      projectId,
      unitNumber: values.unitNumber,
      ownershipId: values.ownershipId,
      contractNumber: values.contractNumber,
      signDate: values.signDate,
      startDate: values.startDate,
      endDate: values.endDate,
    },
  };
}
