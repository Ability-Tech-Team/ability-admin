"use client";

import { useTranslations } from "next-intl";

export type QuickMetric = {
  key: string;
  value: number;
  color: string;
};

type Props = {
  data: QuickMetric[];
};

export default function QuickMetrics({ data }: Props) {
  const t = useTranslations("Dashboard");

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-[12px] font-semibold text-gray-800">
        {t("quickMetrics")}
      </h2>
      <div className="flex items-center justify-around py-2">
        {data.map((m) => (
          <div key={m.key} className="flex flex-col items-center gap-2">
            <DonutRing value={m.value} color={m.color} />
            <span className="text-[10px] text-gray-400">
              {t(m.key as Parameters<typeof t>[0])}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutRing({ value, color }: { value: number; color: string }) {
  const radius = 24;
  const stroke = 7;
  const center = radius + stroke;
  const size = center * 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (value / 100) * circumference;
  const gap = circumference - filled;

  return (
    <div className="relative">
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={stroke}
        />
        {/* Value arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${gap}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-gray-700">
        {value}%
      </span>
    </div>
  );
}
