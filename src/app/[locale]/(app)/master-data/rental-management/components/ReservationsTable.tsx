"use client";

import { useTranslations } from "next-intl";
import { reservationActions, type ReservationListItem } from "@/src/services/rentals";
import type { RentalDialog } from "../types";
import StatusBadge from "./StatusBadge";

type Props = {
  items: ReservationListItem[];
  loading: boolean;
  /** An action is being sent: the row buttons wait. */
  busy: boolean;
  onView: (id: number) => void;
  onAction: (dialog: RentalDialog) => void;
};

const headCell = "px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]";

export default function ReservationsTable({ items, loading, busy, onView, onAction }: Props) {
  const t = useTranslations("MasterData");
  const tRentals = useTranslations("RentalsScreen");

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
      <table className="w-full min-w-[900px] table-fixed">
        <colgroup>
          <col style={{ width: "8%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "16%" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-100">
            <th className={`${headCell} px-3`}>{t("rentalColumns.rentalId")}</th>
            <th className={headCell}>{t("rentalColumns.unit")}</th>
            <th className={headCell}>{t("rentalColumns.tenantName")}</th>
            <th className={headCell}>{tRentals("columns.mobile")}</th>
            <th className={headCell}>{t("rentalColumns.start")}</th>
            <th className={headCell}>{t("rentalColumns.end")}</th>
            <th className={headCell}>{t("rentalColumns.source")}</th>
            <th className={headCell}>{t("columns.status")}</th>
            <th className={headCell}>{t("columns.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={9} className="px-3 py-8 text-center text-[12px] text-gray-400">
                {loading ? tRentals("loading") : tRentals("emptyReservations")}
              </td>
            </tr>
          )}
          {items.map((reservation) => {
            const actions = reservationActions(reservation.statusId);
            const target = {
              id: reservation.id,
              tenantName: reservation.tenantName,
              unitNumber: reservation.unitNumber,
            };
            return (
              <tr key={reservation.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                <td className="px-3 py-4 text-[11px] text-gray-900">{reservation.id}</td>
                <td className="px-2 py-4 text-[11px] text-gray-900">{reservation.unitNumber}</td>
                <td className="px-2 py-4 text-[11px] text-gray-900">{reservation.tenantName}</td>
                <td className="px-2 py-4 text-[11px] text-gray-900" dir="ltr">{reservation.mobileNumber ?? "—"}</td>
                <td className="px-2 py-4 text-[11px] text-gray-600">{reservation.startDate ?? "—"}</td>
                <td className="px-2 py-4 text-[11px] text-gray-600">{reservation.endDate ?? "—"}</td>
                <td className="px-2 py-4 text-[11px] text-gray-900">{reservation.sourceName ?? "—"}</td>
                <td className="px-2 py-4">
                  <StatusBadge kind="reservations" statusId={reservation.statusId} statusName={reservation.statusName} />
                </td>
                <td className="px-2 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onView(reservation.id)}
                      className="rounded-md px-2.5 py-1 text-[11px] font-medium text-gray-700 active:bg-gray-100 active:shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      {t("view")}
                    </button>
                    {actions.checkIn && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onAction({ mode: "checkIn", target })}
                        className="rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {tRentals("actions.checkIn")}
                      </button>
                    )}
                    {actions.checkOut && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onAction({ mode: "checkOut", target })}
                        className="rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {tRentals("actions.checkOut")}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
