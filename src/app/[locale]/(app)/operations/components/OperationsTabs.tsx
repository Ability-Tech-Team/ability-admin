"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/src/i18n/navigation";
import { useSideMenuCounts } from "@/src/hooks/useSideMenuCounts";
import { formatBadge, type SideMenuCountKey } from "@/src/lib/sideMenuCounts";

type Tab = {
  key: string;
  href: string;
  /** Which API count the badge shows (`src/lib/sideMenuCounts.ts`); none means no badge. */
  badge?: SideMenuCountKey;
};

const tabs: Tab[] = [
  { key: "serviceRequests", href: "/operations/service-requests", badge: "serviceRequests" },
  { key: "complaints", href: "/operations/complaints", badge: "complaints" },
  // No count for these in the API yet.
  { key: "invoicesPayments", href: "/operations/invoices-payments" },
  { key: "guestInvitations", href: "/operations/guest-invitations" },
];

type Props = {
  /** Where the browser calls the API, for the badges' counts; null shows none. */
  apiBaseUrl: string | null;
};

export default function OperationsTabs({ apiBaseUrl }: Props) {
  const t = useTranslations("Operations");
  const pathname = usePathname();
  const counts = useSideMenuCounts(apiBaseUrl);

  return (
    <div className="flex items-center gap-0.5 overflow-x-auto px-5">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
        const badge = tab.badge ? formatBadge(counts[tab.badge]) : null;
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
            {badge && (
              <span
                className={`rounded-full px-1.5 py-1 text-[10.5px] font-medium leading-none ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "bg-[#e2e8f0] text-gray-400"
                }`}
              >
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
