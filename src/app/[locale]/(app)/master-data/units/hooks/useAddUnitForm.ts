"use client";

import { useCallback, useState } from "react";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useDropdowns } from "@/src/hooks/useDropdowns";
import { createUnit } from "@/src/services/units";
import type { UnitFormErrors, UnitFormValues } from "../types";
import { emptyUnitForm, validateUnitForm } from "../utils";

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  /** The project the form starts on: the sign-in project, or the list's project filter; "" for none. */
  initialProjectId: string;
  /** After the unit is created, with its id. */
  onCreated: (unitId: number) => void;
};

/** Fields that belong to one project, so choosing another project clears them. */
const PROJECT_FIELDS = { subProjectId: "", locationId: "" } as const;

/**
 * Add Unit: the form's values and problems, the chosen project's unit types, locations and
 * buildings (`GET /definitions/all-dropdowns`), and the save (`POST /projects/units`).
 */
export function useAddUnitForm({ apiBaseUrl, portalBaseUrl, initialProjectId, onCreated }: Options) {
  const [values, setValues] = useState<UnitFormValues>(() => emptyUnitForm(initialProjectId));
  const [errors, setErrors] = useState<UnitFormErrors>({});

  const projectId = /^\d+$/.test(values.projectId) ? Number(values.projectId) : null;
  const dropdowns = useDropdowns({ apiBaseUrl, portalBaseUrl, projectId, enabled: projectId !== null });
  // useApiQuery keeps the last answer while another key loads or fails: never offer the
  // previous project's locations and buildings for this one.
  const lists = dropdowns.loading || dropdowns.failure ? null : dropdowns.data;

  const set = useCallback(<K extends keyof UnitFormValues>(field: K, value: UnitFormValues[K]) => {
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === "projectId" && value !== current.projectId ? PROJECT_FIELDS : {}),
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }, []);

  const save = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const { run } = save;

  const submit = useCallback(async () => {
    const checked = validateUnitForm(values);
    if (!checked.ok) {
      setErrors(checked.errors);
      return;
    }
    setErrors({});
    const unitId = await run(({ apiBaseUrl: base, locale }) => createUnit(base, checked.input, locale));
    if (unitId !== undefined) onCreated(unitId);
  }, [values, run, onCreated]);

  return {
    values,
    errors,
    set,
    submit,
    /** Whether a project is chosen, so its lists can load. */
    hasProject: projectId !== null,
    unitTypes: lists?.unitTypes ?? null,
    locations: lists?.locations ?? null,
    buildings: lists?.subProjects ?? null,
    listsLoading: dropdowns.loading,
    listsFailure: dropdowns.failure,
    reloadLists: dropdowns.reload,
    saving: save.pending,
    saveFailure: save.failure,
  };
}
