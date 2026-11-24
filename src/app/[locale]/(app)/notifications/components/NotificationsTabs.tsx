"use client";

import { useTranslations } from "next-intl";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { Link, usePathname } from "@/src/i18n/navigation";
import { formatBadge } from "@/src/lib/sideMenuCounts";
import { fetchSentNotificationsCount } from "@/src/services/notifications";

type Tab = {
  key: string;
  href: string;
  /** Shows how many notifications were sent (GET /admin/notifications). Never a made-up number. */
  sentCount?: boolean;
};

const tabs: Tab[] = [
  { key: "notifications", href: "/notifications", sentCount: true },
  // No count for these in the API.
  { key: "templates", href: "/notifications/templates" },
  { key: "deliveryLogs", href: "/notifications/delivery-logs" },
];

type Props = {
  /** Where the browser calls the API, for the count; null shows none. */
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

/**
 * The section's tabs. The Notifications tab counts the sends in every project the employee can
 * reach; when that can't be loaded the badge is left out, and the page itself says why.
 */
export default function NotificationsTabs({ apiBaseUrl, portalBaseUrl }: Props) {
  const t = useTranslations("Notifications");
  const pathname = usePathname();
  const sent = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: "sent-count",
    load: ({ apiBaseUrl: base, locale }) => fetchSentNotificationsCount(base, locale),
  });
  const sentBadge = sent.failure ? null : formatBadge(sent.data ?? undefined);

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
            {tab.sentCount && sentBadge && (
              <span
                className={`rounded-full px-1.5 py-1 text-[10.5px] font-medium leading-none ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "bg-[#e2e8f0] text-gray-400"
                }`}
              >
                {sentBadge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
