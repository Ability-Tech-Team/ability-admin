"use client";

import { Link } from "@/src/i18n/navigation";
import { ChangeUpIcon, ChangeDownIcon } from "./icons/StatCardIcons";

type StatCardProps = {
  /** The large display value (e.g. "1,710", "86%", "EGP 243,000"). */
  value: string;
  /** Label below the value. */
  label: string;
  /** Change from previous period — positive = up (green), negative = down (red). */
  change?: number;
  /** The icon rendered inside the colored circle. */
  icon: React.ReactNode;
  /** Tailwind bg class for the icon circle (e.g. "bg-blue-50"). */
  iconBg: string;
  /** Route this card navigates to. "#" means not built yet. */
  href: string;
};

export default function StatCard({
  value,
  label,
  change,
  icon,
  iconBg,
  href,
}: StatCardProps) {
  const content = (
    <div className="flex flex-col gap-2 rounded-xl bg-white px-3 py-3 shadow-sm transition-shadow hover:shadow-md">
      {/* Top row: icon + change badge */}
      <div className="flex items-start justify-between">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}
        >
          {icon}
        </div>
        {change != null && <ChangeBadge value={change} />}
      </div>

      {/* Value */}
      <span className="text-xl font-bold tracking-tight text-gray-900">{value}</span>

      {/* Label */}
      <span className="text-[11px] text-gray-400">{label}</span>
    </div>
  );

  if (href === "#") {
    return (
      <div aria-disabled="true" className="cursor-default">
        {content}
      </div>
    );
  }

  return <Link href={href}>{content}</Link>;
}

function ChangeBadge({ value }: { value: number }) {
  const isUp = value >= 0;
  const Icon = isUp ? ChangeUpIcon : ChangeDownIcon;
  return (
    <span
      className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[12px] font-semibold ${
        isUp ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"
      }`}
    >
      <Icon className="h-[12px] w-[12px]" />
      {Math.abs(value)}
    </span>
  );
}
