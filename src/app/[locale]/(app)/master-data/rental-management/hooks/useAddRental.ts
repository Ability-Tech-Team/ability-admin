"use client";

import { useCallback, useState } from "react";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { ID_TYPE, createRental, fetchRentableUnits } from "@/src/services/rentals";
import { newRentalProblem, type NewRentalProblem } from "../schema";
import type { NewRentalValues } from "../types";

/** The unit picker lists the first this many rentable units of the project. */
export const UNIT_PICKER_LIMIT = 100;

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  /** After a rental is saved. */
  onSaved: () => void;
};

const empty = (projectId: number | null): NewRentalValues => ({
  projectId,
  unitId: null,
  customerName: "",
  idType: ID_TYPE.NATIONAL_ID,
  idNumber: "",
  mobileNumber: "",
  startDate: "",
  endDate: "",
  files: [],
});

/**
 * A new rental (`POST /rentals/tenants`): the project's rentable units come from
 * `GET /rentals/units`, and the chosen unit gives the rental company the API requires.
 */
export function useAddRental({ apiBaseUrl, portalBaseUrl, onSaved }: Options) {
  const [values, setValues] = useState<NewRentalValues>(() => empty(null));
  const [problem, setProblem] = useState<NewRentalProblem | null>(null);
  /** Bumped to clear the file input after "save and add another". */
  const [formKey, setFormKey] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const save = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const { projectId } = values;

  const units = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    enabled: projectId !== null,
    key: `rentable-units-${projectId ?? ""}`,
    load: ({ apiBaseUrl: base, locale }) =>
      fetchRentableUnits(base, projectId, 1, UNIT_PICKER_LIMIT, locale),
  });

  // Only units of the chosen project (the query keeps its last answer while a new one loads).
  const projectUnits = (units.data?.units ?? []).filter((unit) => unit.projectId === projectId);
  const unit = projectUnits.find((candidate) => candidate.id === values.unitId) ?? null;

  const set = useCallback(<K extends keyof NewRentalValues>(field: K, value: NewRentalValues[K]) => {
    setValues((previous) => ({
      ...previous,
      [field]: value,
      // A unit belongs to one project.
      ...(field === "projectId" && { unitId: null }),
    }));
  }, []);

  const submit = useCallback(
    async (addAnother: boolean) => {
      const found = newRentalProblem(values, unit);
      setProblem(found);
      if (found || !unit || values.projectId === null || unit.rentalCompanyId === null) return false;
      const input = {
        projectId: values.projectId,
        unitId: unit.id,
        unitNumber: unit.unitNumber,
        rentalCompanyId: unit.rentalCompanyId,
        customerName: values.customerName,
        idType: values.idType,
        idNumber: values.idNumber,
        mobileNumber: values.mobileNumber,
        startDate: values.startDate,
        endDate: values.endDate,
        files: values.files,
      };
      const done = await save.run(async ({ apiBaseUrl: base, locale }) => {
        await createRental(base, input, locale);
        return true;
      });
      if (!done) return false;
      onSaved();
      // The unit is rented now: the picker reads the project's units again.
      units.reload();
      if (addAnother) {
        setValues(empty(values.projectId));
        setFormKey((key) => key + 1);
        setSavedCount((count) => count + 1);
      }
      return true;
    },
    [values, unit, save, onSaved, units],
  );

  return {
    values,
    set,
    problem,
    units: projectUnits,
    unitsLoading: units.loading,
    unitsFailure: units.failure,
    unitsLoaded: units.data !== null && !units.loading,
    unit,
    submit,
    saving: save.pending,
    saveFailure: save.failure,
    formKey,
    savedCount,
  };
}
