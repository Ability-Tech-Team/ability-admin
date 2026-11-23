import type { IdTypeId } from "@/src/services/rentals";

/** The two lists the screen shows: reservations, and the walk-in requests waiting for one. */
export type RentalView = "reservations" | "walkIns";

/** The row a dialog acts on, with what its question names. */
export type RentalDialogTarget = {
  id: number;
  tenantName: string;
  unitNumber: string | null;
};

export type RentalDialogMode =
  | "checkIn"
  | "cancel"
  | "extend"
  | "checkOut"
  | "terminate"
  | "accept"
  | "reject";

export type RentalDialog = { mode: RentalDialogMode; target: RentalDialogTarget };

/** What a dialog's fields hold, as typed. */
export type RentalDialogValues = {
  rating: string;
  penalty: string;
  newEndDate: string;
  reason: string;
};

export type NewRentalValues = {
  projectId: number | null;
  unitId: number | null;
  customerName: string;
  idType: IdTypeId;
  idNumber: string;
  mobileNumber: string;
  startDate: string;
  endDate: string;
  files: File[];
};
