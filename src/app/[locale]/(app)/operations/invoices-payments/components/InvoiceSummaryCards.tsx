"use client";

import { useTranslations } from "next-intl";
import type { InvoiceStats } from "@/src/services/invoices";
import { formatAmount } from "../utils";

type Props = {
  /** Null until the figures have loaded (or when they failed). */
  stats: InvoiceStats | null;
  loading: boolean;
};

const cards = [
  { key: "totalOutstanding", colorClass: "border-blue-200 bg-blue-50/50", labelColor: "text-blue-600", valueColor: "text-blue-700" },
  // The API has no due dates, so nothing is overdue; the card stays, without a figure.
  { key: "overdueAmount", colorClass: "border-red-200 bg-red-50/50", labelColor: "text-red-500", valueColor: "text-red-600" },
  { key: "collectedThisMonth", colorClass: "border-emerald-200 bg-emerald-50/50", labelColor: "text-emerald-600", valueColor: "text-emerald-700" },
] as const;

export default function InvoiceSummaryCards({ stats, loading }: Props) {
  const t = useTranslations("Operations");
  const tScreen = useTranslations("InvoicesScreen");

  function value(key: (typeof cards)[number]["key"]): number | null {
    if (!stats) return null;
    if (key === "totalOutstanding") return stats.totalOutstanding;
    if (key === "collectedThisMonth") return stats.collectedThisMonth;
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 px-5 sm:grid-cols-3" aria-busy={loading}>
      {cards.map((card) => {
        const amount = value(card.key);
        const unavailable = card.key === "overdueAmount";
        return (
          <div
            key={card.key}
            className={`flex flex-col rounded-xl border px-4 py-3 ${card.colorClass}`}
            title={unavailable ? tScreen("notAvailable") : undefined}
          >
            <span className={`text-[11px] font-medium ${card.labelColor}`}>
              {t(`invoice.summary.${card.key}`)}
            </span>
            <span
              className={`text-[20px] font-bold mt-1 ${card.valueColor} ${loading && !unavailable ? "opacity-50" : ""}`}
            >
              {amount === null ? "—" : formatAmount(amount)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
