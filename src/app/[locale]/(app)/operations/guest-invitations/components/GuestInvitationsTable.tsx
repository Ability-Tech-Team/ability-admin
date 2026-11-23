"use client";

import { useTranslations } from "next-intl";
import type { GuestInvitation } from "../types";
import { qrStatusOf } from "../utils";

type Props = {
  invitations: GuestInvitation[];
  /** True before the first page arrives. */
  loading: boolean;
  onView: (invitation: GuestInvitation) => void;
  /** The pager, under the rows. */
  footer: React.ReactNode;
};

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

const headClass = "px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]";
const none = "—";

export default function GuestInvitationsTable({ invitations, loading, onView, footer }: Props) {
  const t = useTranslations("Operations");
  const tg = useTranslations("GuestInvitationsScreen");

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm mx-5">
      <table className="w-full min-w-[720px] table-fixed">
        <colgroup>
          <col style={{ width: "20%" }} />
          <col style={{ width: "25%" }} />
          <col style={{ width: "25%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "15%" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-100">
            <th className={headClass}>{t("guest.columns.guest")}</th>
            <th className={headClass}>{t("guest.columns.invitedBy")}</th>
            <th className={headClass}>{t("guest.columns.visitDate")}</th>
            <th className={headClass}>{t("guest.columns.qrStatus")}</th>
            <th className={headClass}><span className="sr-only">{t("guest.actions.view")}</span></th>
          </tr>
        </thead>
        <tbody>
          {invitations.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-[11px] text-gray-400" aria-live="polite">
                {loading ? tg("loading") : tg("empty")}
              </td>
            </tr>
          )}
          {invitations.map((row) => {
            const qrStatus = qrStatusOf(row.status);
            return (
              <tr key={row.id} className="border-b border-gray-50 last:border-b-0">
                {/* Guest */}
                <td className="px-4 py-2.5">
                  <p className="text-[12px] font-medium text-gray-900">{row.guestName ?? none}</p>
                  <p className="text-[10.5px] text-gray-400 mt-0.5">{row.guestMobile}</p>
                </td>

                {/* Invited By */}
                <td className="px-4 py-2.5">
                  <p className="text-[12px] text-gray-900">{row.residentName}</p>
                  <p className="text-[10.5px] text-gray-400 mt-0.5">
                    {row.projectName ? `${row.projectName} · ${row.unitNumber}` : row.unitNumber}
                  </p>
                </td>

                {/* Visit Date: the invitation's period */}
                <td className="px-4 py-2.5">
                  <p className="text-[12px] text-gray-900">{row.validFrom}</p>
                  <p className="text-[10.5px] text-gray-400 mt-0.5">{tg("until", { date: row.validTo })}</p>
                </td>

                {/* QR Status */}
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${qrStatusBadge[qrStatus]}`}>
                    <span className={`h-2 w-2 rounded-full ${qrStatusDot[qrStatus]}`} />
                    <span className="text-[10.5px] font-medium">{t(`guest.qrStatuses.${qrStatus}`)}</span>
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => onView(row)}
                    className="text-[11px] text-gray-500 hover:text-gray-700 active:bg-gray-100 active:shadow-sm rounded px-2 py-0.5 border border-gray-200 transition-colors"
                  >
                    {t("guest.actions.view")}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4">{footer}</div>
    </div>
  );
}
