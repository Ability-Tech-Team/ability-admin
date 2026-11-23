"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import type { ApiFailure } from "@/src/lib/apiFailure";
import type { CustomerFormField, CustomerFormValues, Named } from "../types";
import { CREATE_REQUIRED, emptyCustomerForm, missingFields } from "../utils";
import CustomerFormFields from "./CustomerFormFields";

type Props = {
  projects: { options: Named[] | null; forbidden: boolean; failure: ApiFailure | null };
  /** Resolves true once the customer is saved. */
  onSave: (values: CustomerFormValues) => Promise<boolean>;
  saving: boolean;
  failure: ApiFailure | null;
  onClose: () => void;
};

export default function AddCustomerModal({ projects, onSave, saving, failure, onClose }: Props) {
  const t = useTranslations("MasterData");
  const tc = useTranslations("CustomersScreen");
  const [values, setValues] = useState<CustomerFormValues>(() => emptyCustomerForm());
  const [missing, setMissing] = useState<CustomerFormField[]>([]);
  const [saved, setSaved] = useState(false);

  function change(field: CustomerFormField, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setMissing((previous) => previous.filter((name) => name !== field));
    setSaved(false);
  }

  async function submit(addAnother: boolean) {
    const empty = missingFields(values, CREATE_REQUIRED);
    setMissing(empty);
    if (empty.length > 0) return;
    if (!(await onSave(values))) return;
    if (addAnother) {
      // Keep the project: the next customer usually joins the same one.
      setValues(emptyCustomerForm(values.projectId));
      setSaved(true);
    } else {
      onClose();
    }
  }

  // `CreateCustomerDto` requires the id type, country, customer type, marital status and
  // religion, and no admin route lists those choices: a new customer can't be saved, so both
  // saves stay disabled (and `submit` stops at those empty required fields anyway).
  const unavailable = tc("notAvailable");

  return (
    <ModalWrapper onClose={onClose} width="max-w-[560px]" labelledBy="add-customer-title">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 id="add-customer-title" className="text-[15px] font-bold text-gray-900">{t("addCustomerModal.title")}</h2>
            <CloseButton onClick={onClose} label={t("cancel")} />
          </div>

          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              void submit(false);
            }}
          >
            {/* Fields */}
            <div className="px-6 overflow-y-auto flex-1">
              <CustomerFormFields
                variant="add"
                values={values}
                onChange={change}
                required={CREATE_REQUIRED}
                missing={missing}
                disabled={saving}
                projects={projects}
              />
              {!projects.forbidden && projects.failure && <ApiFailureNotice failure={projects.failure} className="mt-4" />}
              {failure && <ApiFailureNotice failure={failure} className="mt-4" />}
              {saved && (
                <p role="status" className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
                  {tc("customerSaved")}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-end gap-3 px-6 pt-5 pb-5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                disabled
                title={unavailable}
                onClick={() => void submit(true)}
                className="rounded-lg border border-blue-600 px-4 py-2 text-[12px] font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                {t("addCustomerModal.saveAndAddAnother")}
              </button>
              <button
                type="submit"
                disabled
                title={unavailable}
                className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                {saving ? tc("saving") : t("addCustomerModal.submit")}
              </button>
            </div>
          </form>
    </ModalWrapper>
  );
}
