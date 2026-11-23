"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import type { ApiFailure } from "@/src/lib/apiFailure";
import type { FamilyMemberRequest } from "../types";

type Props = {
  /** `reject` asks for an optional reason; `revert` confirms taking an approval back. */
  mode: "reject" | "revert";
  request: FamilyMemberRequest;
  /** Resolves true once saved. */
  onConfirm: (reason: string) => Promise<boolean>;
  pending: boolean;
  failure: ApiFailure | null;
  onClose: () => void;
};

export default function AnswerRequestDialog({ mode, request, onConfirm, pending, failure, onClose }: Props) {
  const t = useTranslations("MasterData");
  const tf = useTranslations("FamilyMembersScreen");
  const [reason, setReason] = useState("");
  const name = request.name || request.idNumber;

  async function confirm() {
    if (await onConfirm(reason)) onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-60 bg-black/30 backdrop-blur-xs" onClick={onClose} />
      <div className="fixed inset-0 z-70 flex items-center justify-center p-4" onClick={onClose}>
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="answer-request-title"
          aria-describedby="answer-request-body"
          className="w-full max-w-[400px] rounded-xl bg-white p-5 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="answer-request-title" className="text-[13px] font-semibold text-gray-900">
            {mode === "reject" ? tf("rejectTitle") : tf("revertTitle")}
          </h2>
          <div id="answer-request-body" className="mt-3 flex flex-col gap-3 text-[11px] text-gray-600">
            <p>{mode === "reject" ? tf("rejectBody", { name }) : tf("revertBody", { name })}</p>
            {mode === "reject" && (
              <div>
                <label htmlFor="reject-reason" className="mb-1 block text-[10px] font-medium text-gray-500">
                  {tf("rejectReason")}
                </label>
                <textarea
                  id="reject-reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={pending}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-[11px] text-gray-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
              </div>
            )}
            {failure && <ApiFailureNotice failure={failure} />}
          </div>
          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-200 bg-white px-5 py-2 text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={() => void confirm()}
              disabled={pending}
              className="rounded-full bg-red-600 px-5 py-2 text-[11px] font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {pending ? tf("saving") : mode === "reject" ? t("familyColumns.reject") : tf("revert")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
