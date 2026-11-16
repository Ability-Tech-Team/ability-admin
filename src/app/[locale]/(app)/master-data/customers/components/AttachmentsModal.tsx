"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { Customer } from "@/src/services/customers";

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
      {/* Backdrop */}
      <div className="fixed inset-0 z-60 bg-black/20 backdrop-blur-xs" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5">
            <h2 className="text-[13px] font-semibold text-gray-900">
              {t("attachmentsTitle")} — {customer.name}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
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
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 start-1/2 z-80 -translate-x-1/2 rounded-lg bg-emerald-500 px-5 py-3 text-[12px] font-medium text-white shadow-lg">
          ✓ {t("openingFile", { fileName: toast })}
        </div>
      )}
    </>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
