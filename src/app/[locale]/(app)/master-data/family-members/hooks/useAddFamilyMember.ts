"use client";

import { useCallback, useState } from "react";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { addFamilyMember } from "@/src/services/familyMembers";
import { searchOwnedUnits } from "@/src/services/units";
import {
  defaultOwnerId,
  emptyRelativeForm,
  validateRelativeForm,
  type RelativeFormErrors,
  type RelativeFormValues,
} from "../utils";

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  /** After a relative is added (the modal may stay open for another). */
  onAdded: () => void;
};

/**
 * Add Family Member (`POST /customers/relatives`): the form, the "Assign to Unit" search over
 * owned units (`GET /projects/units`), and saving, with "save and add another".
 */
export function useAddFamilyMember({ apiBaseUrl, portalBaseUrl, onAdded }: Options) {
  const [values, setValues] = useState<RelativeFormValues>(emptyRelativeForm);
  const [errors, setErrors] = useState<RelativeFormErrors>({});
  const [unitQuery, setUnitQueryValue] = useState("");
  /** Bumped to clear the file input and refocus after "save and add another". */
  const [formKey, setFormKey] = useState(0);
  const [addedCount, setAddedCount] = useState(0);
  const save = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const debouncedQuery = useDebouncedValue(unitQuery);
  const searching = values.unit === null && debouncedQuery.trim().length > 0;

  const units = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: `owned-units|${debouncedQuery.trim()}`,
    enabled: searching,
    load: ({ apiBaseUrl: base, locale }) => searchOwnedUnits(base, debouncedQuery, locale),
  });

  const set = useCallback(<K extends keyof RelativeFormValues>(field: K, value: RelativeFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }, []);

  const setUnitQuery = useCallback((text: string) => {
    setUnitQueryValue(text);
    // Typing again drops the chosen unit and its owner.
    setValues((current) => (current.unit ? { ...current, unit: null, ownerId: null } : current));
  }, []);

  const chooseUnit = useCallback((unit: RelativeFormValues["unit"]) => {
    setValues((current) => ({ ...current, unit, ownerId: defaultOwnerId(unit) }));
    setErrors((current) => ({ ...current, unit: undefined, ownerId: undefined }));
    setUnitQueryValue(unit ? `${unit.projectName ?? ""} - ${unit.unitNumber}` : "");
  }, []);

  const { run, reset: resetSave } = save;
  const submit = useCallback(
    async (another: boolean) => {
      const checked = validateRelativeForm(values);
      if (!checked.ok) {
        setErrors(checked.errors);
        return false;
      }
      setErrors({});
      const relativeId = await run(({ apiBaseUrl: base, locale }) => addFamilyMember(base, checked.input, locale));
      if (relativeId === undefined) return false;
      setAddedCount((count) => count + 1);
      onAdded();
      if (another) {
        // Keep the unit and owner: relatives are usually added to one unit together.
        setValues((current) => ({ ...emptyRelativeForm(), unit: current.unit, ownerId: current.ownerId }));
        setFormKey((key) => key + 1);
      }
      return true;
    },
    [values, run, onAdded],
  );

  const reset = useCallback(() => {
    setValues(emptyRelativeForm());
    setErrors({});
    setUnitQueryValue("");
    setAddedCount(0);
    resetSave();
  }, [resetSave]);

  return {
    values,
    set,
    errors,
    unitQuery,
    setUnitQuery,
    chooseUnit,
    /** Matching owned units while the user types; null when not searching. */
    unitOptions: searching && !units.loading ? (units.data ?? []) : null,
    unitsLoading: searching && units.loading,
    unitsFailure: searching ? units.failure : null,
    submit,
    pending: save.pending,
    failure: save.failure,
    formKey,
    /** How many were added since the modal opened ("save and add another"). */
    addedCount,
    reset,
  };
}
