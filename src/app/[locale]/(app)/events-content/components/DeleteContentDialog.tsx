"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import type { ContentDelete } from "../hooks/useContentDelete";

type Props = {
  kind: "news" | "event" | "guideline" | "contact";
  deletion: ContentDelete;
};

/**
 * Confirms deleting a news article, event, guideline or phone contact, over its edit form; styled
 * as Delete Customer. Shown while `deletion.target` is set.
 */
export default function DeleteContentDialog({ kind, deletion }: Props) {
  const t = useTranslations("EventsContent.deleteDialog");
  const { target, cancel, confirm, pending, failure } = deletion;
  const open = target !== null;

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") cancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, cancel]);

  if (!target) return null;

  async function handleConfirm() {
    if (await confirm()) toast.success(t(`deleted.${kind}`));
  }

  return (
    <>
      <div className="fixed inset-0 z-80 bg-black/30 backdrop-blur-xs" />
      <div className="fixed inset-0 z-90 flex items-center justify-center p-4" onClick={cancel}>
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-content-title"
          aria-describedby="delete-content-body"
          className="w-full max-w-[400px] rounded-xl bg-white p-5 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="delete-content-title" className="text-[13px] font-semibold text-gray-900">{t(`title.${kind}`)}</h2>

          <div id="delete-content-body" className="mt-3 flex flex-col gap-3 text-[11px] text-gray-600">
            <p className="wrap-break-word">{t("body", { name: target.name })}</p>
            <p className="font-medium text-red-600">{t("irreversible")}</p>
            {failure && <ApiFailureNotice failure={failure} />}
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              autoFocus
              onClick={cancel}
              disabled={pending}
              className="rounded-full border border-gray-200 bg-white px-5 py-2 text-[11px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={pending}
              className="rounded-full bg-red-600 px-5 py-2 text-[11px] font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {pending ? t("deleting") : t("delete")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
