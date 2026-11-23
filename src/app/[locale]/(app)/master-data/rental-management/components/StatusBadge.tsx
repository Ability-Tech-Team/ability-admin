"use client";

import { useTranslations } from "next-intl";
import { RENTAL_STATUS_IDS, WALK_IN_STATUS_IDS } from "@/src/services/rentals";
import type { RentalView } from "../types";
import { statusBadgeClass } from "../utils";

type Props = {
  kind: RentalView;
  statusId: number | null;
  /** The API's name for it, in the request's language. */
  statusName: string | null;
};

/** A status as the API names it, else by its id; "—" when there is none. */
export default function StatusBadge({ kind, statusId, statusName }: Props) {
  const t = useTranslations("RentalsScreen");
  const known: readonly number[] = kind === "walkIns" ? WALK_IN_STATUS_IDS : RENTAL_STATUS_IDS;
  const label =
    statusName ??
    (statusId !== null && known.includes(statusId)
      ? t(kind === "walkIns" ? `walkInStatuses.${statusId}` : `reservationStatuses.${statusId}`)
      : null);

  if (!label) return <span className="text-[11px] text-gray-300">—</span>;

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusBadgeClass(kind, statusId)}`}
    >
      {label}
    </span>
  );
}
