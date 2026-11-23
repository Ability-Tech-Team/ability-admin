"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import type { ApiFailure } from "@/src/lib/apiFailure";
import type { Customer, CustomerFormField, CustomerFormValues } from "../types";
import { customerFormFrom, EDIT_REQUIRED, missingFields } from "../utils";
import CustomerFormFields from "./CustomerFormFields";

type EditCustomerModalProps = {
  customer: Customer;
  /** Resolves true once saved (or when nothing changed). */
  onSave: (values: CustomerFormValues) => Promise<boolean>;
  saving: boolean;
  failure: ApiFailure | null;
  onClose: () => void;
  /** Opens the delete confirmation. */
  onDelete: () => void;
};

export default function EditCustomerModal({ customer, onSave, saving, failure, onClose, onDelete }: EditCustomerModalProps) {
  const t = useTranslations("MasterData");
  const tc = useTranslations("CustomersScreen");
  const [values, setValues] = useState<CustomerFormValues>(() => customerFormFrom(customer));
  const [missing, setMissing] = useState<CustomerFormField[]>([]);

  function change(field: CustomerFormField, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setMissing((previous) => previous.filter((name) => name !== field));
  }

  async function handleSave() {
    const empty = missingFields(values, EDIT_REQUIRED);
    setMissing(empty);
    if (empty.length > 0) return;
    if (await onSave(values)) onClose();
  }

  return (
    <ModalWrapper onClose={onClose} width="max-w-[580px]" labelledBy="edit-customer-title">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3">
            <h2 id="edit-customer-title" className="text-[13px] font-semibold text-gray-900">{t("editCustomer")}</h2>
            <CloseButton onClick={onClose} label={t("cancel")} />
          </div>

          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave();
            }}
          >
            {/* Form */}
            <div className="px-5 pb-4 overflow-y-auto flex-1">
              <CustomerFormFields
                variant="edit"
                values={values}
                onChange={change}
                required={EDIT_REQUIRED}
                missing={missing}
                disabled={saving}
                savedNames={{
                  idTypeId: customer.idTypeName,
                  countryId: customer.countryName,
                  customerTypeId: customer.customerTypeName,
                  maritalStatusId: customer.maritalStatusName,
                  religionId: customer.religionName,
                }}
              />
              {failure && <ApiFailureNotice failure={failure} className="mt-3" />}
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-center gap-3 border-t border-gray-100 px-5 py-3">
              <button
                type="button"
                onClick={onDelete}
                disabled={saving}
                className="rounded-full bg-red-600 px-5 py-2 text-[11px] font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {t("removeCustomer")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-gray-200 bg-white px-5 py-2 text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-blue-600 px-5 py-2 text-[11px] font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? tc("saving") : t("saveChanges")}
              </button>
            </div>
          </form>
    </ModalWrapper>
  );
}
