"use client";

import { useCallback, useState } from "react";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useDropdowns } from "@/src/hooks/useDropdowns";
import { useOwnedUnitSearch } from "@/src/hooks/useOwnedUnitSearch";
import { createInvoice } from "@/src/services/invoices";
import { validateGenerateInvoice, type GenerateInvoiceErrors } from "../utils";

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  /** After the API has raised the invoice, with its number. */
  onCreated: (invoiceNumber: string) => void;
};

/**
 * The Generate Invoice form (`POST /orders/invoices`): an owned unit and its owner (the unit
 * search), one of the unit's project's invoice types, and the amount. The modal mounts it when
 * it opens, so every opening starts empty.
 */
export function useGenerateInvoice({ apiBaseUrl, portalBaseUrl, onCreated }: Options) {
  const unitSearch = useOwnedUnitSearch({ apiBaseUrl, portalBaseUrl });
  const [invoiceTypeId, setInvoiceTypeIdValue] = useState<number | null>(null);
  const [amount, setAmountValue] = useState("");
  const [errors, setErrors] = useState<GenerateInvoiceErrors>({});

  const unit = unitSearch.unit;
  const projectId = unit?.projectId ?? null;

  // The invoice types are per project: the chosen unit's.
  const dropdowns = useDropdowns({ apiBaseUrl, portalBaseUrl, projectId, enabled: projectId !== null });
  const invoiceTypes = projectId !== null && !dropdowns.loading ? (dropdowns.data?.invoiceTypes ?? null) : null;

  // A type chosen for one project doesn't apply to another unit's project.
  const [typeProjectId, setTypeProjectId] = useState<number | null>(null);
  if (typeProjectId !== projectId) {
    setTypeProjectId(projectId);
    setInvoiceTypeIdValue(null);
  }

  const saving = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const { run } = saving;

  const setInvoiceTypeId = useCallback((value: number | null) => {
    setInvoiceTypeIdValue(value);
    setErrors((previous) => ({ ...previous, invoiceTypeId: undefined }));
  }, []);

  const setAmount = useCallback((value: string) => {
    setAmountValue(value);
    setErrors((previous) => ({ ...previous, amount: undefined }));
  }, []);

  const submit = useCallback(async () => {
    const checked = validateGenerateInvoice({ unit, ownerId: unitSearch.ownerId, invoiceTypeId, amount });
    if (!checked.ok) {
      setErrors(checked.errors);
      return;
    }
    setErrors({});
    const created = await run(({ apiBaseUrl: base, locale }) => createInvoice(base, checked.body, locale));
    if (created) onCreated(created.invoiceNumber);
  }, [unit, unitSearch.ownerId, invoiceTypeId, amount, run, onCreated]);

  return {
    unitSearch,
    invoiceTypeId,
    setInvoiceTypeId,
    /** The unit's project's invoice types; null until a unit is chosen and while they load. */
    invoiceTypes,
    invoiceTypesLoading: projectId !== null && dropdowns.loading,
    invoiceTypesFailure: projectId !== null ? dropdowns.failure : null,
    reloadInvoiceTypes: dropdowns.reload,
    amount,
    setAmount,
    /** The last submit's problems, each gone once its field is filled. */
    errors: {
      ...errors,
      unit: unit ? undefined : errors.unit,
      ownerId: unitSearch.ownerId !== null ? undefined : errors.ownerId,
    },
    submit,
    pending: saving.pending,
    failure: saving.failure,
  };
}

export type GenerateInvoiceForm = ReturnType<typeof useGenerateInvoice>;
