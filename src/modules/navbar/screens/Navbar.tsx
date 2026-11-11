"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import { routing } from "@/src/i18n/routing";
import { useLocale } from "next-intl";
import { CalendarIcon, SearchIcon, BellIcon, ChevronDownIcon } from "../components/icons";
import type { SearchTab } from "../types/types";

type NavbarProps = {
  userName?: string;
  userRole?: string;
  userInitials?: string;
  notificationCount?: number;
};

const searchTabs: SearchTab[] = ["unitNumber", "customerName", "mobile", "idNumber"];

export default function Navbar({
  userName = "",
  userRole = "",
  userInitials = "",
  notificationCount = 0,
}: NavbarProps) {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<SearchTab>("unitNumber");
  const [searchQuery, setSearchQuery] = useState("");

  const otherLocales = routing.locales.filter((l) => l !== locale);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 bg-white px-4 shadow-sm">
      {/* All Projects dropdown */}
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:bg-blue-50 hover:border-blue-400 transition-colors"
      >
        <CalendarIcon className="h-3.5 w-3.5 text-blue-500" />
        <span className="whitespace-nowrap">{t("allProjects")}</span>
        <ChevronDownIcon className="h-3 w-3 text-gray-400" />
      </button>

      {/* Search tabs + input */}
      <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center">
          {searchTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:bg-blue-50"
              }`}
            >
              {t(tab)}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative border-s border-gray-200">
          <SearchIcon className="absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(`searchPlaceholder_${activeTab}`)}
            className="h-8 w-[260px] bg-[#f8fafc] ps-8 pe-3 text-[11px] text-gray-700 placeholder:text-gray-400 outline-none"
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Locale switcher */}
        <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
          <span className="px-2.5 py-1 text-[11px] font-semibold text-gray-500 uppercase bg-white">
            {locale}
          </span>
          {otherLocales.map((l) => (
            <Link
              key={l}
              href="/"
              locale={l}
              lang={l}
              className="px-2.5 py-1 text-[11px] font-semibold text-gray-400 uppercase border-s border-gray-200 hover:bg-blue-50 transition-colors"
            >
              {l}
            </Link>
          ))}
        </div>

        {/* Notifications */}
        <button type="button" className="relative p-1.5 rounded-full hover:bg-gray-100 transition-colors">
          <BellIcon className="h-5 w-5 text-gray-500" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200" />

        {/* User */}
        <button type="button" className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-gray-50 transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
            {userInitials}
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-[12px] font-semibold text-gray-800 leading-tight">{userName}</span>
            <span className="text-[10px] text-gray-400 leading-tight">{userRole}</span>
          </div>
          <ChevronDownIcon className="h-3 w-3 text-gray-400" />
        </button>
      </div>
    </header>
  );
}
