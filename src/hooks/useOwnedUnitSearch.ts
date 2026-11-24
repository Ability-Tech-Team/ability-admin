"use client";

import { useCallback, useState } from "react";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { searchOwnedUnits, type Unit } from "@/src/services/units";

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

/** The owner a form acts for: the unit's only owner, or none until one of several is chosen. */
export function defaultOwnerId(unit: Unit | null): number | null {
  return unit && unit.owners.length === 1 ? unit.owners[0].customerId : null;
}

/**
 * Picking an owned unit and its owner by unit number (`GET /projects/units`, units with an owner
 * only), for the forms that act for a resident: New Request, New Complaint, Generate Invoice.
 * The unit carries its project, so these forms work for every role.
 */
export function useOwnedUnitSearch({ apiBaseUrl, portalBaseUrl }: Options) {
  const [query, setQueryValue] = useState("");
  const [unit, setUnit] = useState<Unit | null>(null);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const debouncedQuery = useDebouncedValue(query);
  const searching = unit === null && debouncedQuery.trim().length > 0;

  const units = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: `owned-units|${debouncedQuery.trim()}`,
    enabled: searching,
    load: ({ apiBaseUrl: base, locale }) => searchOwnedUnits(base, debouncedQuery, locale),
  });

  /** Typing again drops the chosen unit and its owner. */
  const setQuery = useCallback((text: string) => {
    setQueryValue(text);
    setUnit(null);
    setOwnerId(null);
  }, []);

  const choose = useCallback((next: Unit | null) => {
    setUnit(next);
    setOwnerId(defaultOwnerId(next));
    setQueryValue(next ? `${next.projectName ?? ""} - ${next.unitNumber}` : "");
  }, []);

  const reset = useCallback(() => {
    setQueryValue("");
    setUnit(null);
    setOwnerId(null);
  }, []);

  const owner = unit?.owners.find((candidate) => candidate.customerId === ownerId) ?? null;

  return {
    query,
    setQuery,
    unit,
    choose,
    ownerId,
    setOwnerId,
    /** The chosen owner (name and id), once there is one. */
    owner,
    /** Matching owned units while the user types; null when not searching. */
    options: searching && !units.loading ? (units.data ?? []) : null,
    loading: searching && units.loading,
    failure: searching ? units.failure : null,
    reset,
  };
}

export type OwnedUnitSearch = ReturnType<typeof useOwnedUnitSearch>;
