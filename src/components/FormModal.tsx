"use client";

import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";

export type FormField = {
  name: string;
  label: string;
  required?: boolean;
  type?: "text" | "textarea" | "date";
  defaultValue?: string;
  /** 2 = full width, 1 = half width (default) */
  colSpan?: 1 | 2;
  rows?: number;
};

type Props = {
  title: string;
  fields: FormField[];
  submitLabel: string;
  cancelLabel: string;
  onClose: () => void;
  onSubmit?: () => void;
  /** Extra content rendered after the fields grid (e.g. a unit selector or info banner). */
  children?: React.ReactNode;
};

export default function FormModal({ title, fields, submitLabel, cancelLabel, onClose, onSubmit, children }: Props) {
  return (
    <ModalWrapper onClose={onClose} width="w-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <h2 className="text-[15px] font-bold text-gray-900">{title}</h2>
        <CloseButton onClick={onClose} />
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-6">
        {fields.map((field) => (
          <div key={field.name} className={field.colSpan === 2 ? "col-span-2" : ""}>
            <label className="mb-1 block text-[11px] font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea
                rows={field.rows ?? 4}
                defaultValue={field.defaultValue}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors resize-none"
              />
            ) : (
              <input
                type={field.type ?? "text"}
                defaultValue={field.defaultValue}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            )}
          </div>
        ))}
      </div>

      {/* Extra content */}
      {children && <div className="px-6 mt-4">{children}</div>}

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 pt-5 pb-5">
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onSubmit}
          className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </ModalWrapper>
  );
}
