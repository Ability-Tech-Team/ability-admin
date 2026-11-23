"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import {
  canRecordPayment,
  invoiceStatusKey,
  type Invoice,
} from "@/src/services/invoices";
import { formatAmount, initials, statusLook } from "../utils";

type Props = {
  /** Null until the first page has loaded. */
  invoices: Invoice[] | null;
  /** True while a page loads; the previous rows stay, dimmed. */
  loading: boolean;
  onRecordPayment: (invoice: Invoice) => void;
  /** Disables "Mark paid" while a payment is being saved. */
  paymentPending: boolean;
  /** The pager, drawn in the table's footer. */
  footer?: React.ReactNode;
};

const avatarColors = [
  "bg-blue-600",
  "bg-pink-500",
  "bg-blue-500",
  "bg-indigo-600",
  "bg-emerald-500",
];

const headerCell =
  "px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]";

const unavailableAction =
  "text-[11px] rounded px-1.5 py-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export default function InvoicesTable({ invoices, loading, onRecordPayment, paymentPending, footer }: Props) {
  const t = useTranslations("Operations");
  const tScreen = useTranslations("InvoicesScreen");
  const unavailableId = useId();

  function statusLabel(invoice: Invoice): string {
    if (invoice.statusName) return invoice.statusName;
    const key = invoiceStatusKey(invoice.statusId);
    return key ? tScreen(`statuses.${key}`) : "—";
  }

  const columns = 9;

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm mx-5">
      <span id={unavailableId} className="sr-only">
        {tScreen("notAvailable")}
      </span>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] table-fixed" aria-busy={loading}>
          <colgroup>
            <col style={{ width: "11%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "6%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "17%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-100">
              <th className={headerCell}>{t("invoice.columns.invoiceId")}</th>
              <th className={headerCell}>{t("columns.customer")}</th>
              <th className={headerCell}>{t("invoice.columns.project")}</th>
              <th className={headerCell}>{t("invoice.columns.unit")}</th>
              <th className={headerCell}>{t("invoice.columns.invoiceType")}</th>
              <th className={headerCell}>{t("invoice.columns.amount")}</th>
              <th className={headerCell}>{tScreen("columns.invoiceDate")}</th>
              <th className={headerCell}>{t("columns.status")}</th>
              <th className={headerCell}>
                <span className="sr-only">{tScreen("columns.actions")}</span>
              </th>
            </tr>
          </thead>
          <tbody className={loading && invoices ? "opacity-50" : ""}>
            {!invoices && loading && (
              <tr>
                <td colSpan={columns} className="px-4 py-8 text-center text-[12px] text-gray-400">
                  {tScreen("loading")}
                </td>
              </tr>
            )}
            {invoices && invoices.length === 0 && (
              <tr>
                <td colSpan={columns} className="px-4 py-8 text-center text-[12px] text-gray-400">
                  {tScreen("empty")}
                </td>
              </tr>
            )}
            {invoices?.map((row, i) => {
              const look = statusLook(row.statusId);
              const avatar = initials(row.customerName);
              const payable = canRecordPayment(row);

              return (
                <tr key={row.id} className="border-b border-gray-50 last:border-b-0">
                  {/* Invoice number */}
                  <td className="px-4 py-2.5">
                    <span className="inline-block max-w-full truncate rounded bg-gray-50 px-2 py-0.5 text-[9.5px] text-gray-900" title={row.invoiceNumber}>
                      {row.invoiceNumber}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${avatarColors[i % avatarColors.length]}`}
                      >
                        {avatar ?? "—"}
                      </span>
                      <span className="truncate text-[12px] text-gray-900">{row.customerName ?? "—"}</span>
                    </div>
                  </td>

                  {/* Project */}
                  <td className="px-4 py-2.5">
                    <span className="text-[12px] text-gray-900">{row.projectName ?? "—"}</span>
                  </td>

                  {/* Unit */}
                  <td className="px-4 py-2.5">
                    <span className="text-[12px] text-gray-500">{row.unitNumber}</span>
                  </td>

                  {/* Invoice type: the project's own types, named by the API */}
                  <td className="px-4 py-2.5">
                    {row.invoiceTypeName ? (
                      <span className="inline-block max-w-full truncate rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10.5px] font-medium text-blue-600 whitespace-nowrap" title={row.invoiceTypeName}>
                        {row.invoiceTypeName}
                      </span>
                    ) : (
                      <span className="text-[12px] text-gray-400">—</span>
                    )}
                  </td>

                  {/* Amount, without a currency */}
                  <td className="px-4 py-2.5">
                    <span className="text-[11px] font-semibold text-gray-900">
                      {formatAmount(row.totalAmount)}
                    </span>
                  </td>

                  {/* Invoice date */}
                  <td className="px-4 py-2.5">
                    <span className="text-[11px] text-gray-900">{row.invoiceDate ?? "—"}</span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${look.badge}`}>
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${look.dot}`} />
                      <span className="truncate text-[10.5px] font-medium">{statusLabel(row)}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span title={tScreen("notAvailable")}>
                        <button
                          type="button"
                          disabled
                          aria-describedby={unavailableId}
                          className={`${unavailableAction} text-blue-600`}
                        >
                          {t("invoice.actions.view")}
                        </button>
                      </span>
                      {payable && (
                        <button
                          type="button"
                          onClick={() => onRecordPayment(row)}
                          disabled={paymentPending}
                          className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium active:bg-emerald-50 active:shadow-sm rounded px-1.5 py-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                        >
                          {t("invoice.actions.markPaid")}
                        </button>
                      )}
                      <span title={tScreen("notAvailable")}>
                        <button
                          type="button"
                          disabled
                          aria-describedby={unavailableId}
                          className={`${unavailableAction} text-gray-500`}
                        >
                          {t("invoice.actions.download")}
                        </button>
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {footer && <div className="border-t border-gray-100 px-4">{footer}</div>}
    </div>
  );
}
