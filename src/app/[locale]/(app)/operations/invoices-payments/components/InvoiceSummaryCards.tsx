"use client";

import { useTranslations } from "next-intl";
import type { InvoiceStats } from "@/src/services/invoices";

type Props = { stats: InvoiceStats };

function formatAmount(n: number) {
  return n.toLocaleString("en-US");
}

const cards = [
  { key: "totalOutstanding", colorClass: "border-blue-200 bg-blue-50/50", labelColor: "text-blue-600", valueColor: "text-blue-700" },
  { key: "overdueAmount", colorClass: "border-red-200 bg-red-50/50", labelColor: "text-red-500", valueColor: "text-red-600" },
  { key: "collectedThisMonth", colorClass: "border-emerald-200 bg-emerald-50/50", labelColor: "text-emerald-600", valueColor: "text-emerald-700" },
] as const;

export default function InvoiceSummaryCards({ stats }: Props) {
  const t = useTranslations("Operations");

  const values: Record<string, number> = {
    totalOutstanding: stats.totalOutstanding,
    overdueAmount: stats.overdueAmount,
    collectedThisMonth: stats.collectedThisMonth,
  };

  return (
    <div className="grid grid-cols-3 gap-3 px-5">
      {cards.map((card) => (
        <div
          key={card.key}
          className={`flex flex-col rounded-xl border px-4 py-3 ${card.colorClass}`}
        >
          <span className={`text-[11px] font-medium ${card.labelColor}`}>
            {t(`invoice.summary.${card.key}` as Parameters<typeof t>[0])}
          </span>
          <span className={`text-[20px] font-bold mt-1 ${card.valueColor}`}>
            EGP {formatAmount(values[card.key])}
          </span>
        </div>
      ))}
    </div>
  );
}
