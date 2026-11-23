"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { toSideMenuCounts, type SideMenuCounts } from "@/src/lib/sideMenuCounts";
import { fetchDashboardMetrics } from "@/src/services/dashboard";

const ALL_TIME = { startDate: "", endDate: "" };

/**
 * The side menu and the section tabs (Master Data, Operations) show the same counts on one
 * page, so they share one request for a short while instead of each calling the API. These
 * are display numbers, not an access decision.
 */
const SHARE_MS = 30_000;
let shared: { key: string; at: number; promise: Promise<SideMenuCounts> } | null = null;

function loadCounts(apiBaseUrl: string, locale: string): Promise<SideMenuCounts> {
  const key = `${apiBaseUrl}|${locale}`;
  if (shared && shared.key === key && Date.now() - shared.at < SHARE_MS) return shared.promise;
  const promise = fetchDashboardMetrics(apiBaseUrl, ALL_TIME, locale).then(toSideMenuCounts);
  shared = { key, at: Date.now(), promise };
  // A failure isn't shared: the next page load asks again.
  promise.catch(() => {
    if (shared?.promise === promise) shared = null;
  });
  return promise;
}

/**
 * The menu badges' counts, from the dashboard's all-time metrics. Any failure, such as a role
 * other than Super Admin (403) or an ended session (401), leaves the badges out: the page
 * itself reports those.
 */
export function useSideMenuCounts(apiBaseUrl: string | null): SideMenuCounts {
  const locale = useLocale();
  const [counts, setCounts] = useState<SideMenuCounts>({});

  useEffect(() => {
    if (!apiBaseUrl) return;
    let current = true;
    loadCounts(apiBaseUrl, locale).then(
      (next) => {
        if (current) setCounts(next);
      },
      () => {
        if (current) setCounts({});
      },
    );
    return () => {
      current = false;
    };
  }, [apiBaseUrl, locale]);

  return apiBaseUrl ? counts : {};
}
