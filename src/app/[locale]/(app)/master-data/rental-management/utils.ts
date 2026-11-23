import { RENTAL_STATUS, WALK_IN_STATUS } from "@/src/services/rentals";

const yellow = "border border-yellow-300 bg-yellow-50 text-yellow-600";
const green = "border border-green-300 bg-green-50 text-green-600";
const red = "border border-red-300 bg-red-50 text-red-600";
const gray = "border border-gray-300 bg-gray-50 text-gray-600";
const blue = "border border-[#bedbff] bg-[#eff6ff] text-[#1447e6]";

const reservationStatusClass: Record<number, string> = {
  [RENTAL_STATUS.FEES_COLLECTION_PENDING]: yellow,
  [RENTAL_STATUS.ACTIVE]: green,
  [RENTAL_STATUS.FINISHED]: gray,
  [RENTAL_STATUS.CANCELED]: red,
  [RENTAL_STATUS.TERMINATED]: red,
};

const walkInStatusClass: Record<number, string> = {
  [WALK_IN_STATUS.PENDING]: yellow,
  [WALK_IN_STATUS.ACCEPTED]: green,
  [WALK_IN_STATUS.REJECTED]: red,
  [WALK_IN_STATUS.UNIT_RESERVED]: blue,
};

/** The badge colours of a status; an unknown one is grey, never "active". */
export function statusBadgeClass(kind: "reservations" | "walkIns", statusId: number | null): string {
  if (statusId === null) return gray;
  return (kind === "reservations" ? reservationStatusClass : walkInStatusClass)[statusId] ?? gray;
}

/** Plain numbers: the API gives amounts without a currency. */
export function formatAmount(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(amount);
}
