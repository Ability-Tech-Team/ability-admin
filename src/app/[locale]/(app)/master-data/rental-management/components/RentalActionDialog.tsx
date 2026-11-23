"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import type { ApiFailure } from "@/src/lib/apiFailure";
import type { RentalDialogProblem } from "../schema";
import type { RentalDialog, RentalDialogValues } from "../types";

type Props = {
  dialog: RentalDialog;
  problem: RentalDialogProblem | null;
  pending: boolean;
  failure: ApiFailure | null;
  onSubmit: (values: RentalDialogValues) => void;
  onClose: () => void;
};

const input =
  "h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors";
const label = "mb-1 block text-[11px] font-medium text-gray-700";

/** Confirms an action, with the fields its route takes (rating, penalty, date, reason). */
export default function RentalActionDialog({ dialog, problem, pending, failure, onSubmit, onClose }: Props) {
  const t = useTranslations("MasterData");
  const tRentals = useTranslations("RentalsScreen");
  const [values, setValues] = useState<RentalDialogValues>({ rating: "", penalty: "", newEndDate: "", reason: "" });
  const { mode, target } = dialog;
  const unit = target.unitNumber ?? "—";
  const destructive = mode === "cancel" || mode === "terminate" || mode === "reject";

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (field: keyof RentalDialogValues) => (event: { target: { value: string } }) =>
    setValues((previous) => ({ ...previous, [field]: event.target.value }));

  const title =
    mode === "accept" ? t("familyColumns.approve") : mode === "reject" ? t("familyColumns.reject") : tRentals(`actions.${mode}`);

  return (
    <>
      <div className="fixed inset-0 z-60 bg-black/30 backdrop-blur-xs" onClick={onClose} />
      <div className="fixed inset-0 z-70 flex items-center justify-center p-4" onClick={onClose}>
        <form
          role="dialog"
          aria-modal="true"
          aria-labelledby="rental-action-title"
          className="flex w-[380px] max-w-full flex-col gap-4 rounded-xl bg-white p-5 shadow-xl"
          onClick={(event) => event.stopPropagation()}
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(values);
          }}
        >
          <h3 id="rental-action-title" className="text-[13px] font-semibold text-gray-900">
            {title}
          </h3>
          <p className="text-[12px] text-gray-600">
            {tRentals(`dialogs.${mode}`, { tenant: target.tenantName, unit })}
          </p>

          {mode === "checkOut" && (
            <div>
              <label htmlFor="rental-rating" className={label}>
                {tRentals("dialogs.rating")} <span className="text-red-500">*</span>
              </label>
              <select id="rental-rating" value={values.rating} onChange={set("rating")} className={`${input} bg-white`}>
                <option value="">—</option>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === "extend" && (
            <div>
              <label htmlFor="rental-end-date" className={label}>
                {tRentals("dialogs.newEndDate")} <span className="text-red-500">*</span>
              </label>
              <input id="rental-end-date" type="date" value={values.newEndDate} onChange={set("newEndDate")} className={input} />
            </div>
          )}

          {(mode === "terminate" || mode === "reject") && (
            <div>
              <label htmlFor="rental-reason" className={label}>
                {tRentals("dialogs.reason")} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rental-reason"
                rows={3}
                value={values.reason}
                onChange={set("reason")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors resize-none"
              />
            </div>
          )}

          {(mode === "checkOut" || mode === "terminate") && (
            <div>
              <label htmlFor="rental-penalty" className={label}>
                {tRentals("dialogs.penalty")}
              </label>
              <input
                id="rental-penalty"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={values.penalty}
                onChange={set("penalty")}
                className={input}
              />
            </div>
          )}

          {problem && (
            <p role="alert" className="text-[12px] text-red-600">
              {tRentals(`dialogs.problems.${problem}`)}
            </p>
          )}
          {failure && <ApiFailureNotice failure={failure} />}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="rounded-lg px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {tRentals("dialogs.back")}
            </button>
            <button
              type="submit"
              disabled={pending}
              className={`rounded-lg px-4 py-2 text-[12px] font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                destructive ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {pending ? tRentals("dialogs.sending") : tRentals("dialogs.confirm")}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
