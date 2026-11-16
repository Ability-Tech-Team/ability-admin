"use client";

import { useTranslations } from "next-intl";
import FormModal, { type FormField } from "@/src/components/FormModal";

type Props = {
  onClose: () => void;
};

export default function GenerateInvoiceModal({ onClose }: Props) {
  const t = useTranslations("Operations");

  const fields: FormField[] = [
    { name: "customerName", label: t("invoice.generate.customerName"), required: true },
    { name: "invoiceType", label: t("invoice.generate.invoiceType"), required: true, defaultValue: "Maintenance Fee" },
    { name: "amount", label: t("invoice.generate.amount"), required: true },
    { name: "dueDate", label: t("invoice.generate.dueDate"), required: true, type: "date" },
  ];

  return (
    <FormModal
      title={t("invoice.generate.title")}
      fields={fields}
      submitLabel={t("invoice.generateInvoice")}
      cancelLabel={t("invoice.generate.cancel")}
      onClose={onClose}
    >
      {/* Units */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-gray-700">
          {t("invoice.generate.units")}
        </label>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-[12px] text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <FilterIcon className="h-3.5 w-3.5 text-gray-400" />
          {t("invoice.generate.selectUnits")}
          <ChevronDownIcon className="h-3 w-3 text-gray-400" />
        </button>
      </div>

      {/* Info banner */}
      <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 px-4 py-2.5">
        <p className="text-[11px] text-blue-700">
          {t("invoice.generate.unitInfo")}
        </p>
      </div>
    </FormModal>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 0 1 .628.74v2.288a2.25 2.25 0 0 1-.659 1.59l-4.682 4.683a2.25 2.25 0 0 0-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 0 1 8 18.25v-5.757a2.25 2.25 0 0 0-.659-1.591L2.659 6.22A2.25 2.25 0 0 1 2 4.629V2.34a.75.75 0 0 1 .628-.74Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}
