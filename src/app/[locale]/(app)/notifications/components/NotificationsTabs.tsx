"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/src/i18n/navigation";

type Tab = {
  key: string;
  href: string;
  count?: number;
};

const tabs: Tab[] = [
  { key: "notifications", href: "/notifications", count: 4 },
  { key: "templates", href: "/notifications/templates" },
  { key: "deliveryLogs", href: "/notifications/delivery-logs" },
];

export default function NotificationsTabs() {
  const t = useTranslations("Notifications");
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-0.5 overflow-x-auto px-5">
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/notifications"
            ? pathname === "/notifications"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[11.5px] font-medium transition-all ${
              isActive
                ? "bg-white text-gray-900 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1)] ring-1 ring-gray-200"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {t(`tabs.${tab.key}` as Parameters<typeof t>[0])}
            {tab.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-1 text-[10.5px] font-medium leading-none ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "bg-[#e2e8f0] text-gray-400"
                }`}
              >
                {tab.count.toLocaleString()}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
