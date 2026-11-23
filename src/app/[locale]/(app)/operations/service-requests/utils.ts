import { TICKET_STATUS } from "@/src/services/serviceRequests";

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
