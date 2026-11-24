"use client";

import { useId } from "react";
import FormField from "@/src/components/FormField";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import type { OwnedUnitSearch } from "@/src/hooks/useOwnedUnitSearch";

type Props = {
  search: OwnedUnitSearch;
  labels: {
    unit: string;
    /** The search box's placeholder. */
    hint: string;
    searching: string;
    noUnits: string;
    owner: string;
    chooseOwner: string;
  };
  /** The unit's and the owner's error text, when the form flags them. */
  unitError?: string | null;
  ownerError?: string | null;
  inputClass: string;
  invalidClass?: string;
};

/**
 * The unit search ("Assign to Unit" in Add Family Member) and, when the unit has several owners,
 * the owner to act for. Shared by the forms that act for a resident.
 */
export default function OwnedUnitPicker({ search, labels, unitError, ownerError, inputClass, invalidClass = "border-red-300" }: Props) {
  const listId = useId();
  const unit = search.unit;

  return (
    <>
      <div className="relative">
        <FormField label={labels.unit} required>
          <input
            type="text"
            value={search.query}
            onChange={(event) => search.setQuery(event.target.value)}
            placeholder={labels.hint}
            role="combobox"
            aria-controls={listId}
            aria-expanded={search.options !== null}
            aria-autocomplete="list"
            aria-invalid={Boolean(unitError)}
            className={`${inputClass} ${unitError ? invalidClass : ""}`}
          />
        </FormField>
        {unitError && <p className="mt-1 text-[10px] text-red-600">{unitError}</p>}
        {search.loading && <p className="mt-1 text-[10px] text-gray-400">{labels.searching}</p>}
        {search.failure && <ApiFailureNotice failure={search.failure} className="mt-1" />}
        {search.options && (
          <ul id={listId} role="listbox" className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {search.options.length === 0 && <li className="px-3 py-2 text-[11px] text-gray-400">{labels.noUnits}</li>}
            {search.options.map((option) => (
              <li key={option.id} role="option" aria-selected={false}>
                <button
                  type="button"
                  onClick={() => search.choose(option)}
                  className="w-full px-3 py-1.5 text-start text-[12px] text-gray-700 hover:bg-gray-50"
                >
                  {option.projectName ?? "—"} - {option.unitNumber}
                  <span className="ms-2 text-[10px] text-gray-400">{option.owners.map((owner) => owner.name).join(", ")}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {unit && unit.owners.length > 1 && (
        <div>
          <FormField label={labels.owner} required>
            <select
              value={search.ownerId ?? ""}
              onChange={(event) => search.setOwnerId(event.target.value ? Number(event.target.value) : null)}
              aria-invalid={Boolean(ownerError)}
              className={`${inputClass} ${ownerError ? invalidClass : ""}`}
            >
              <option value="">{labels.chooseOwner}</option>
              {unit.owners.map((owner) => (
                <option key={owner.customerId} value={owner.customerId}>{owner.name}</option>
              ))}
            </select>
          </FormField>
          {ownerError && <p className="mt-1 text-[10px] text-red-600">{ownerError}</p>}
        </div>
      )}
    </>
  );
}
