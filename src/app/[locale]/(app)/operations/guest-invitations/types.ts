export type {
  GuestInvitation,
  GuestInvitationCounts,
  GuestInvitationFilters,
  GuestInvitationStatus,
} from "@/src/services/guestInvitations";

/** The screen's words for an invitation's status (`Operations.guest.qrStatuses`). */
export type QrStatus = "active" | "scheduled" | "expired" | "revoked";

/** The create form's values. */
export type GuestInvitationFormValues = {
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  /** "", "male" or "female". */
  guestGender: string;
  /** The chosen resident's customer id, "" until chosen. */
  residentId: string;
  /** One of the resident's active units, "" until chosen. */
  unitId: string;
  /** `YYYY-MM-DDTHH:mm`, as a datetime-local input gives it: Cairo clock time for the API. */
  validFrom: string;
  validTo: string;
};

export type GuestInvitationFormField = keyof GuestInvitationFormValues;
