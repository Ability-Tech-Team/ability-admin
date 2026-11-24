"use client";

import { useCallback, useMemo, useState } from "react";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useDropdowns } from "@/src/hooks/useDropdowns";
import { useOwnedUnitSearch } from "@/src/hooks/useOwnedUnitSearch";
import { createComplaint } from "@/src/services/complaints";
import type { Unit } from "@/src/services/units";
import {
  effectiveComplaintStatusId,
  emptyComplaintForm,
  localDate,
  validateComplaintForm,
  type ComplaintFormErrors,
  type ComplaintFormField,
  type ComplaintFormValues,
} from "../utils";

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  /** After the complaint is saved. */
  onCreated: () => void;
};

/**
 * New Complaint (`POST /orders/complains`): the unit and owner (the shared owned-unit search),
 * the unit's project's complaint types and statuses (`GET /definitions/all-dropdowns`), the
 * form, and saving. The modal mounts this hook, so closing it starts the next one afresh.
 */
export function useNewComplaint({ apiBaseUrl, portalBaseUrl, onCreated }: Options) {
  const [values, setValues] = useState<ComplaintFormValues>(() => emptyComplaintForm(localDate(new Date())));
  const [errors, setErrors] = useState<ComplaintFormErrors>({});
  const unitSearch = useOwnedUnitSearch({ apiBaseUrl, portalBaseUrl });
  const { unit, owner } = unitSearch;
  const save = useApiMutation({ apiBaseUrl, portalBaseUrl });

  // The lists belong to the unit's project, so they load once a unit is chosen.
  const lists = useDropdowns({ apiBaseUrl, portalBaseUrl, projectId: unit?.projectId ?? null, enabled: unit !== null });
  const listsReady = unit !== null && !lists.loading && lists.data !== null;
  const data = listsReady ? lists.data : null;
  const types = useMemo(() => data?.complaintTypes ?? [], [data]);
  const statuses = useMemo(() => data?.complaintStatuses ?? [], [data]);

  const clearError = useCallback((field: ComplaintFormField) => {
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  }, []);

  const set = useCallback(
    <K extends keyof ComplaintFormValues>(field: K, value: ComplaintFormValues[K]) => {
      setValues((current) => ({ ...current, [field]: value }));
      clearError(field === "typeId" ? "type" : field === "statusId" ? "status" : field);
    },
    [clearError],
  );

  // The unit's and owner's errors clear when the unit search changes.
  const { setQuery, choose, setOwnerId: chooseOwner } = unitSearch;
  const setUnitQuery = useCallback(
    (text: string) => {
      setQuery(text);
      clearError("unit");
      clearError("owner");
    },
    [setQuery, clearError],
  );
  const chooseUnit = useCallback(
    (next: Unit | null) => {
      choose(next);
      clearError("unit");
      clearError("owner");
    },
    [choose, clearError],
  );
  const setOwnerId = useCallback(
    (ownerId: Parameters<typeof chooseOwner>[0]) => {
      chooseOwner(ownerId);
      clearError("owner");
    },
    [chooseOwner, clearError],
  );

  const { run } = save;
  /** Resolves true when the complaint was saved. */
  const submit = useCallback(async () => {
    const checked = validateComplaintForm(values, { unit, owner, types, statuses });
    if (!checked.ok) {
      setErrors(checked.errors);
      return false;
    }
    setErrors({});
    const saved = await run(async ({ apiBaseUrl: base, locale }) => {
      await createComplaint(base, checked.body, locale);
      return true;
    });
    if (!saved) return false;
    onCreated();
    return true;
  }, [values, unit, owner, types, statuses, run, onCreated]);

  // A type from another project's list isn't offered any more once the unit changes.
  const typeId = types.some((type) => type.id === values.typeId) ? values.typeId : null;

  return {
    values,
    set,
    errors,
    /** The unit search, with handlers that also clear the unit's and owner's errors. */
    unitSearch: { ...unitSearch, setQuery: setUnitQuery, choose: chooseUnit, setOwnerId },
    typeId,
    statusId: listsReady ? effectiveComplaintStatusId(values, statuses) : null,
    types,
    statuses,
    listsLoading: unit !== null && lists.loading,
    listsFailure: unit !== null ? lists.failure : null,
    reloadLists: lists.reload,
    submit,
    pending: save.pending,
    failure: save.failure,
  };
}
