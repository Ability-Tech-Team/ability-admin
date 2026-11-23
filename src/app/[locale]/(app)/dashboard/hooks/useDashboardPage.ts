"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { ApiError } from "@/src/lib/apiClient";
import { buildPortalSignInUrl } from "@/src/lib/portal";
import {
  fetchDashboardMetrics,
  fetchLatestServiceRequests,
  fetchOccupancy,
  fetchTopServices,
  type DashboardPeriod,
} from "@/src/services/dashboard";
import type { DashboardData, DashboardFailure } from "../types";
import { isValidPeriod } from "../utils";

type Options = {
  /** Where the browser calls the API (`browserApiBaseUrl`), or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
};

type Loaded = {
  /** The request these results answer, so a slower, older answer never replaces a newer one. */
  key: string;
  data: DashboardData | null;
  failure: DashboardFailure | null;
};

function toFailure(error: unknown, portalBaseUrl: string | null, locale: string): DashboardFailure {
  if (!(error instanceof ApiError)) return { reason: "failed" };
  if (error.kind === "session_ended") {
    return {
      reason: "sessionEnded",
      signInUrl: portalBaseUrl
        ? buildPortalSignInUrl(portalBaseUrl, locale, window.location.href)
        : undefined,
    };
  }
  // The dashboard routes are limited to the Super Admin role.
  if (error.status === 403) return { reason: "forbidden" };
  if (error.kind === "unreachable") return { reason: "unreachable" };
  return { reason: "failed" };
}

/**
 * The dashboard's figures for the chosen period (empty dates: all time). It keeps showing
 * the last figures while a new period loads, and reports why loading failed.
 */
export function useDashboardPage({ apiBaseUrl, portalBaseUrl }: Options) {
  const locale = useLocale();
  const [period, setPeriod] = useState<DashboardPeriod>({ startDate: "", endDate: "" });
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  const periodValid = isValidPeriod(period);
  const key = `${locale}|${period.startDate}|${period.endDate}|${attempt}`;

  useEffect(() => {
    if (!apiBaseUrl || !periodValid) return;
    let current = true;

    Promise.all([
      fetchDashboardMetrics(apiBaseUrl, period, locale),
      fetchTopServices(apiBaseUrl, period, locale),
      fetchOccupancy(apiBaseUrl, period, locale),
      fetchLatestServiceRequests(apiBaseUrl, locale),
    ]).then(
      ([metrics, topServices, occupancy, latestRequests]) => {
        if (current) {
          setLoaded({ key, data: { metrics, topServices, occupancy, latestRequests }, failure: null });
        }
      },
      (error: unknown) => {
        if (current) {
          setLoaded((previous) => ({
            key,
            data: previous?.data ?? null,
            failure: toFailure(error, portalBaseUrl, locale),
          }));
        }
      },
    );

    return () => {
      current = false;
    };
  }, [apiBaseUrl, portalBaseUrl, periodValid, period, locale, key]);

  const setStartDate = useCallback(
    (startDate: string) => setPeriod((previous) => ({ ...previous, startDate })),
    [],
  );
  const setEndDate = useCallback(
    (endDate: string) => setPeriod((previous) => ({ ...previous, endDate })),
    [],
  );
  const retry = useCallback(() => setAttempt((previous) => previous + 1), []);

  const failure: DashboardFailure | null = !apiBaseUrl
    ? { reason: "noApi" }
    : !periodValid
      ? { reason: "invalidPeriod" }
      : loaded?.key === key
        ? loaded.failure
        : null;

  return {
    period,
    setStartDate,
    setEndDate,
    data: loaded?.data ?? null,
    loading: Boolean(apiBaseUrl) && periodValid && loaded?.key !== key,
    failure,
    retry,
  };
}
