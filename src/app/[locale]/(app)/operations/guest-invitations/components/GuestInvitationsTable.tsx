"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { GuestInvitation } from "@/src/services/guestInvitations";
import GuestInvitationDetail from "./GuestInvitationDetail";

type Props = { data: GuestInvitation[] };

const qrStatusDot: Record<string, string> = {
  active: "bg-emerald-500",
  scheduled: "bg-blue-500",
  expired: "bg-gray-400",
  revoked: "bg-red-500",
};

const qrStatusBadge: Record<string, string> = {
  active: "border-emerald-300 bg-emerald-50 text-emerald-600",
  scheduled: "border-blue-300 bg-blue-50 text-blue-600",
  expired: "border-gray-300 bg-gray-50 text-gray-500",
  revoked: "border-red-300 bg-red-50 text-red-500",
};

const locationBadge: Record<string, string> = {
  "inside-zone": "border-emerald-300 bg-emerald-50 text-emerald-700",
  "outside-zone": "border-orange-300 bg-orange-50 text-orange-700",
};

export default function GuestInvitationsTable({ data }: Props) {
  const t = useTranslations("Operations");
  const [selected, setSelected] = useState<GuestInvitation | null>(null);

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm mx-5">
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: "15%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "16%" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("guest.columns.guest")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("guest.columns.invitedBy")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("guest.columns.visitDate")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("guest.columns.qrStatus")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("guest.columns.locationRule")}
            </th>
            <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("guest.columns.scans")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]" />
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b border-gray-50 last:border-b-0">
              {/* Guest */}
              <td className="px-4 py-2.5">
                <p className="text-[12px] font-medium text-gray-900">{row.guestName}</p>
                <p className="text-[10.5px] text-gray-400 mt-0.5">{row.guestPhone}</p>
              </td>

              {/* Invited By */}
              <td className="px-4 py-2.5">
                <p className="text-[12px] text-gray-900">{row.invitedByName}</p>
                <p className="text-[10.5px] text-gray-400 mt-0.5">{row.invitedByLocation}</p>
              </td>

              {/* Visit Date */}
              <td className="px-4 py-2.5">
                <span className="text-[12px] text-gray-900">{row.visitDate}</span>
              </td>

              {/* QR Status */}
              <td className="px-4 py-2.5">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${qrStatusBadge[row.qrStatus]}`}>
                  <span className={`h-2 w-2 rounded-full ${qrStatusDot[row.qrStatus]}`} />
                  <span className="text-[10.5px] font-medium">
                    {t(`guest.qrStatuses.${row.qrStatus}` as Parameters<typeof t>[0])}
                  </span>
                </span>
              </td>

              {/* Location Rule */}
              <td className="px-4 py-2.5">
                <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium whitespace-nowrap ${locationBadge[row.locationRule] ?? ""}`}>
                  {t(`guest.locationRules.${row.locationRule}` as Parameters<typeof t>[0])}
                </span>
              </td>

              {/* Scans */}
              <td className="px-4 py-2.5 text-center">
                <span className="text-[12px] text-gray-900">{row.scans}</span>
              </td>

              {/* Actions */}
              <td className="px-4 py-2.5">
                <button
                  onClick={() => setSelected(row)}
                  className="text-[11px] text-gray-500 hover:text-gray-700 active:bg-gray-100 active:shadow-sm rounded px-2 py-0.5 border border-gray-200 transition-colors"
                >
                  {t("guest.actions.view")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <span className="text-[11px] text-gray-400">
          {t("showing", { from: 1, to: data.length, total: data.length })}
        </span>
        <div className="flex items-center gap-1">
          <button className="flex h-6 w-6 items-center justify-center rounded text-[11px] text-gray-400 hover:bg-gray-50">
            ‹
          </button>
          <button className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-[11px] text-white">
            1
          </button>
          <button className="flex h-6 w-6 items-center justify-center rounded text-[11px] text-gray-400 hover:bg-gray-50">
            ›
          </button>
        </div>
      </div>
      {selected && (
        <GuestInvitationDetail
          invitation={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
