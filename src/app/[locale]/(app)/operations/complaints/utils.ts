import { COMPLAINT_STATUS } from "@/src/services/complaints";

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
