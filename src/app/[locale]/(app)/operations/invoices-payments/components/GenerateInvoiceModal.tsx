"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import CloseButton from "@/src/components/CloseButton";
import FormField from "@/src/components/FormField";
import ModalWrapper from "@/src/components/ModalWrapper";
import OwnedUnitPicker from "@/src/components/OwnedUnitPicker";
import SelectWrapper from "@/src/components/SelectWrapper";
import { useGenerateInvoice } from "../hooks/useGenerateInvoice";
import type { GenerateInvoiceProblem } from "../utils";

type Props = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  /** After the API has raised the invoice, with its number. */
  onCreated: (invoiceNumber: string) => void;
  onClose: () => void;
};

const inputClass =
  "h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors disabled:bg-gray-50 read-only:bg-gray-50";

/**
 * Generate Invoice (`POST /orders/invoices`), with the team's layout: one invoice for an owned
 * unit, in its owner's name, of one of the unit's project's invoice types. The API raises it as
 * Pending with today's date; it has no due date, so the form asks for none.
 */
export default function GenerateInvoiceModal({ apiBaseUrl, portalBaseUrl, onCreated, onClose }: Props) {
  const t = useTranslations("Operations");
  const tScreen = useTranslations("InvoicesScreen");
  const tUnits = useTranslations("FamilyMembersScreen");
  const titleId = useId();
  const typeId = useId();
  const amountId = useId();
  const form = useGenerateInvoice({ apiBaseUrl, portalBaseUrl, onCreated });
  const { unitSearch, errors, pending } = form;
  const unit = unitSearch.unit;
  const severalOwners = Boolean(unit && unit.owners.length > 1);

  function close() {
    if (!pending) onClose();
  }

  function problem(value: GenerateInvoiceProblem | undefined): string | null {
    return value ? tScreen(`generate.errors.${value}`) : null;
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    void form.submit();
  }

  const typeError = problem(errors.invoiceTypeId);
  const amountError = problem(errors.amount);

  return (
    <ModalWrapper onClose={close} width="w-[520px]" labelledBy={titleId}>
      <form onSubmit={submit} noValidate>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 id={titleId} className="text-[15px] font-bold text-gray-900">
            {t("invoice.generateInvoice")}
          </h2>
          <CloseButton onClick={close} label={tScreen("payment.close")} />
        </div>

        {/* Fields */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-6">
          {/* The unit, and its owner when it has several (as the customer name). */}
          <OwnedUnitPicker
            search={unitSearch}
            labels={{
              unit: t("invoice.columns.unit"),
              hint: tUnits("add.unitHint"),
              searching: tUnits("add.searchingUnits"),
              noUnits: tUnits("add.noUnits"),
              owner: tScreen("generate.customerName"),
              chooseOwner: tUnits("add.chooseOwner"),
            }}
            unitError={problem(errors.unit)}
            ownerError={problem(errors.ownerId)}
            inputClass={inputClass}
          />

          {!severalOwners && (
            <FormField label={tScreen("generate.customerName")} required>
              <input
                type="text"
                value={unitSearch.owner?.name ?? ""}
                readOnly
                placeholder={tScreen("generate.customerHint")}
                className={inputClass}
              />
            </FormField>
          )}

          <div>
            <label htmlFor={typeId} className="mb-1 block text-[11px] font-medium text-gray-700">
              {t("invoice.columns.invoiceType")}
              <span className="text-red-500"> *</span>
            </label>
            <SelectWrapper>
              <select
                id={typeId}
                value={form.invoiceTypeId ?? ""}
                onChange={(event) => form.setInvoiceTypeId(event.target.value ? Number(event.target.value) : null)}
                disabled={pending || !form.invoiceTypes || form.invoiceTypes.length === 0}
                aria-invalid={Boolean(typeError)}
                className={`${inputClass} appearance-none pe-8 ${typeError ? "border-red-300" : ""}`}
              >
                <option value="">
                  {form.invoiceTypesLoading ? tScreen("generate.loadingTypes") : tScreen("generate.chooseType")}
                </option>
                {(form.invoiceTypes ?? []).map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </SelectWrapper>
            {typeError && <p className="mt-1 text-[10px] text-red-600">{typeError}</p>}
            {form.invoiceTypes && form.invoiceTypes.length === 0 && (
              <p className="mt-1 text-[10px] text-gray-500">{tScreen("generate.noTypes")}</p>
            )}
            {form.invoiceTypesFailure && (
              <ApiFailureNotice failure={form.invoiceTypesFailure} onRetry={form.reloadInvoiceTypes} className="mt-1" />
            )}
          </div>

          <div>
            <label htmlFor={amountId} className="mb-1 block text-[11px] font-medium text-gray-700">
              {t("invoice.columns.amount")}
              <span className="text-red-500"> *</span>
            </label>
            <input
              id={amountId}
              type="text"
              inputMode="decimal"
              value={form.amount}
              onChange={(event) => form.setAmount(event.target.value)}
              disabled={pending}
              aria-invalid={Boolean(amountError)}
              className={`${inputClass} ${amountError ? "border-red-300" : ""}`}
            />
            {amountError && <p className="mt-1 text-[10px] text-red-600">{amountError}</p>}
          </div>
        </div>

        {/* Info banner */}
        <div className="px-6 mt-4">
          <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-2.5">
            <p className="text-[11px] text-blue-700">{tScreen("generate.unitInfo")}</p>
          </div>
          {form.failure && <ApiFailureNotice failure={form.failure} className="mt-4" />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pt-5 pb-5">
          <button
            type="button"
            onClick={close}
            disabled={pending}
            className="rounded-lg px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {tScreen("payment.cancel")}
          </button>
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? tScreen("payment.submitting") : t("invoice.generateInvoice")}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
