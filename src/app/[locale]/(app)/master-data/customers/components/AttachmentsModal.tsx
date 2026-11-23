"use client";

import { useTranslations } from "next-intl";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import type { Customer } from "../types";

type AttachmentsModalProps = {
  customer: Customer;
  onClose: () => void;
};

/** The customer's files. Their links are signed for a short while after the list loaded. */
export default function AttachmentsModal({ customer, onClose }: AttachmentsModalProps) {
  const t = useTranslations("MasterData");
  const tc = useTranslations("CustomersScreen");

  return (
    <ModalWrapper onClose={onClose} width="max-w-[420px]" labelledBy="attachments-title">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <h2 id="attachments-title" className="text-[13px] font-semibold text-gray-900">
          {t("attachmentsTitle")} — {customer.name}
        </h2>
        <CloseButton onClick={onClose} label={tc("close")} />
      </div>

      {/* Attachments list */}
      <div className="px-5 pb-5 flex flex-col gap-2.5">
        {customer.attachments.length > 0 ? (
          customer.attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold text-gray-900">{attachment.fileName}</p>
                {attachment.createdAt && <p className="text-[9px] text-gray-400">{attachment.createdAt}</p>}
              </div>
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-md border border-gray-200 bg-white px-3 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {t("open")}
              </a>
            </div>
          ))
        ) : (
          <p className="py-4 text-center text-[11px] text-gray-400">{t("noAttachments")}</p>
        )}
      </div>
    </ModalWrapper>
  );
}
