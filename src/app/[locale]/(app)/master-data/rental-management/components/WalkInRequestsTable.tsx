"use client";

import { useTranslations } from "next-intl";
import { walkInActions, type WalkInListItem } from "@/src/services/rentals";
import type { RentalDialog } from "../types";
import StatusBadge from "./StatusBadge";

type Props = {
  items: WalkInListItem[];
  loading: boolean;
  busy: boolean;
  onView: (id: number) => void;
  onAction: (dialog: RentalDialog) => void;
};

const headCell = "px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]";

export default function WalkInRequestsTable({ items, loading, busy, onView, onAction }: Props) {
  const t = useTranslations("MasterData");
  const tRentals = useTranslations("RentalsScreen");

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
      <table className="w-full min-w-[900px] table-fixed">
        <colgroup>
          <col style={{ width: "8%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "15%" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-100">
            <th className={`${headCell} px-3`}>{tRentals("columns.requestId")}</th>
            <th className={headCell}>{t("rentalColumns.unit")}</th>
            <th className={headCell}>{t("rentalColumns.tenantName")}</th>
            <th className={headCell}>{t("rentalColumns.idPassport")}</th>
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
                {loading ? tRentals("loading") : tRentals("emptyWalkIns")}
              </td>
            </tr>
          )}
          {items.map((request) => {
            const actions = walkInActions(request.statusId);
            const target = { id: request.id, tenantName: request.tenantName, unitNumber: request.unitNumber };
            return (
              <tr key={request.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                <td className="px-3 py-4 text-[11px] text-gray-900">{request.id}</td>
                <td className="px-2 py-4 text-[11px] text-gray-900">
                  {[request.projectName, request.unitNumber].filter(Boolean).join(" - ") || "—"}
                </td>
                <td className="px-2 py-4 text-[11px] text-gray-900">{request.tenantName}</td>
                <td className="px-2 py-4 text-[11px] text-gray-900">{request.idNumber}</td>
                <td className="px-2 py-4 text-[11px] text-gray-600">{request.startDate ?? "—"}</td>
                <td className="px-2 py-4 text-[11px] text-gray-600">{request.endDate ?? "—"}</td>
                <td className="px-2 py-4 text-[11px] text-gray-900">{request.sourceName ?? "—"}</td>
                <td className="px-2 py-4">
                  <StatusBadge kind="walkIns" statusId={request.statusId} statusName={request.statusName} />
                </td>
                <td className="px-2 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onView(request.id)}
                      className="rounded-md px-2.5 py-1 text-[11px] font-medium text-gray-700 active:bg-gray-100 active:shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      {t("view")}
                    </button>
                    {actions.accept && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onAction({ mode: "accept", target })}
                        className="rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {t("familyColumns.approve")}
                      </button>
                    )}
                    {actions.reject && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onAction({ mode: "reject", target })}
                        className="rounded-md bg-red-500 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {t("familyColumns.reject")}
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
