import type { CustomerFilters, CustomerUnit } from "@/src/services/customers";
import type { CreateGuestInvitationBody } from "@/src/services/guestInvitations";
import type {
  GuestInvitationFormField,
  GuestInvitationFormValues,
  GuestInvitationStatus,
  QrStatus,
} from "./types";

const toQr: Record<GuestInvitationStatus, QrStatus> = {
  active: "active",
  upcoming: "scheduled",
  expired: "expired",
  inactive: "revoked",
};

/** The API's status in the screen's words: a cancelled invitation is "revoked". */
export function qrStatusOf(status: GuestInvitationStatus): QrStatus {
  return toQr[status];
}

/** The API status a status filter value stands for, or null for a value it doesn't know. */
export function apiStatusOf(value: string | null): GuestInvitationStatus | null {
  const match = (Object.keys(toQr) as GuestInvitationStatus[]).find((status) => toQr[status] === value);
  return match ?? null;
}

/**
 * The customers search that finds a resident: digits (and `+`) look in the mobile number,
 * anything else in the name.
 */
export function residentSearchFilters(text: string): CustomerFilters {
  const search = text.trim();
  return {
    search,
    searchField: /^\+?[\d\s]+$/.test(search) ? "mobile" : "name",
    projectId: null,
    ownershipId: null,
  };
}

/** The units a resident can invite a guest to: their active links. */
export function invitableUnits(units: CustomerUnit[]): CustomerUnit[] {
  return units.filter((unit) => unit.active);
}

export function emptyGuestInvitationForm(): GuestInvitationFormValues {
  return {
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    guestGender: "",
    residentId: "",
    unitId: "",
    validFrom: "",
    validTo: "",
  };
}

export const GUEST_REQUIRED: readonly GuestInvitationFormField[] = [
  "guestName",
  "guestPhone",
  "residentId",
  "unitId",
  "validFrom",
  "validTo",
];

const clockTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/** Required fields left empty, plus `validTo` when the period ends before it starts. */
export function invalidGuestFields(values: GuestInvitationFormValues): GuestInvitationFormField[] {
  const invalid = GUEST_REQUIRED.filter((field) => !values[field].trim());
  for (const field of ["validFrom", "validTo"] as const) {
    if (values[field] && !clockTime.test(values[field]) && !invalid.includes(field)) invalid.push(field);
  }
  if (clockTime.test(values.validFrom) && clockTime.test(values.validTo) && values.validTo <= values.validFrom) {
    if (!invalid.includes("validTo")) invalid.push("validTo");
  }
  return invalid;
}

/** The create body; call it once `invalidGuestFields(values)` is empty. */
export function buildCreateGuestInvitationBody(
  values: GuestInvitationFormValues,
  unit: CustomerUnit,
): CreateGuestInvitationBody {
  const email = values.guestEmail.trim();
  const gender = values.guestGender === "male" || values.guestGender === "female" ? values.guestGender : undefined;
  return {
    project_id: unit.projectId,
    customer_id: Number(values.residentId),
    unit_id: unit.unitId,
    guest_name: values.guestName.trim(),
    mobile_number: values.guestPhone.trim(),
    valid_from: values.validFrom,
    valid_to: values.validTo,
    ...(gender && { gender }),
    ...(email && { email }),
  };
}
