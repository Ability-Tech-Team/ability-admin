"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import type { ApiFailure } from "@/src/lib/apiFailure";
import {
  amountDue,
  paymentMethodKeys,
  type Invoice,
  type PaymentMethodKey,
} from "@/src/services/invoices";
import { formatAmount } from "../utils";

type Props = {
  invoice: Invoice;
  pending: boolean;
  failure: ApiFailure | null;
  onSubmit: (details: { amount: number; paymentMethod: PaymentMethodKey; referenceNumber: string }) => void;
  onClose: () => void;
};

const fieldClass =
  "h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors disabled:bg-gray-50";

/**
 * "Mark paid": records one payment for what is still due
 * (`POST /orders/invoices/transactions/pay`), after which the API marks the invoice collected.
 * The API collects the whole invoice on any payment, so the amount is the full remainder.
 */
export default function RecordPaymentModal({ invoice, pending, failure, onSubmit, onClose }: Props) {
  const t = useTranslations("InvoicesScreen");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodKey>("cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const titleId = useId();
  const methodId = useId();
  const referenceId = useId();
  const due = amountDue(invoice);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({ amount: due, paymentMethod, referenceNumber });
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <form
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onSubmit={submit}
          className="w-[440px] max-w-full rounded-xl bg-white shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 id={titleId} className="text-[15px] font-bold text-gray-900">
              {t("payment.title")}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("payment.close")}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-4 px-6">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-gray-50 px-4 py-3 text-[12px]">
              <dt className="text-gray-500">{t("payment.invoice")}</dt>
              <dd className="text-end font-medium text-gray-900">{invoice.invoiceNumber}</dd>
              <dt className="text-gray-500">{t("payment.customer")}</dt>
              <dd className="text-end text-gray-900">{invoice.customerName ?? "—"}</dd>
              <dt className="text-gray-500">{t("payment.amountDue")}</dt>
              <dd className="text-end font-semibold text-gray-900">{formatAmount(due)}</dd>
            </dl>

            <div>
              <label htmlFor={methodId} className="mb-1 block text-[11px] font-medium text-gray-700">
                {t("payment.method")}
                <span className="text-red-500"> *</span>
              </label>
              <select
                id={methodId}
                value={paymentMethod}
                onChange={(event) => {
                  const next = paymentMethodKeys.find((key) => key === event.target.value);
                  if (next) setPaymentMethod(next);
                }}
                disabled={pending}
                className={fieldClass}
              >
                {paymentMethodKeys.map((key) => (
                  <option key={key} value={key}>
                    {t(`payment.methods.${key}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={referenceId} className="mb-1 block text-[11px] font-medium text-gray-700">
                {t("payment.reference")}
              </label>
              <input
                id={referenceId}
                type="text"
                value={referenceNumber}
                onChange={(event) => setReferenceNumber(event.target.value)}
                maxLength={255}
                disabled={pending}
                className={fieldClass}
              />
            </div>

            <p className="text-[11px] text-gray-500">{t("payment.description")}</p>

            {failure && <ApiFailureNotice failure={failure} />}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 pt-5 pb-5">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="rounded-lg px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("payment.cancel")}
            </button>
            <button
              type="submit"
              disabled={pending || due <= 0}
              aria-busy={pending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? t("payment.submitting") : t("payment.submit")}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
