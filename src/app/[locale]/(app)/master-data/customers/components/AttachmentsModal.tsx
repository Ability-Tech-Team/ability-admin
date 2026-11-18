"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { Customer } from "@/src/services/customers";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";

type AttachmentsModalProps = {
  customer: Customer;
  onClose: () => void;
};

export default function AttachmentsModal({ customer, onClose }: AttachmentsModalProps) {
  const t = useTranslations("MasterData");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((fileName: string) => {
    setToast(fileName);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <>
      <ModalWrapper onClose={onClose} width="max-w-[420px]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5">
          <h2 className="text-[13px] font-semibold text-gray-900">
            {t("attachmentsTitle")} — {customer.name}
          </h2>
          <CloseButton onClick={onClose} />
        </div>

        {/* Attachments list */}
        <div className="px-5 pb-5 flex flex-col gap-2.5">
          {customer.attachments.length > 0 ? (
            customer.attachments.map((attachment, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3"
              >
                <div>
                  <p className="text-[11px] font-semibold text-gray-900">{attachment.name}</p>
                  <p className="text-[9px] text-gray-400">{attachment.fileName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => showToast(attachment.fileName)}
                  className="rounded-md border border-gray-200 bg-white px-3 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {t("open")}
                </button>
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-[11px] text-gray-400">{t("noAttachments")}</p>
          )}
        </div>
      </ModalWrapper>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 start-1/2 z-[80] -translate-x-1/2 rounded-lg bg-emerald-500 px-5 py-3 text-[12px] font-medium text-white shadow-lg">
          ✓ {t("openingFile", { fileName: toast })}
        </div>
      )}
    </>
  );
}
