"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/src/i18n/navigation";
import { ApiError } from "@/src/lib/apiClient";
import { buildPortalSignInUrl } from "@/src/lib/portal";
import {
  buildSupportRequestPayload,
  createSupportRequestSchema,
  SUPPORT_CATEGORIES,
  SUPPORT_LIMITS,
  toFieldErrors,
  type SupportRequestValues,
} from "@/src/lib/supportRequest";
import { sendSupportRequest, type SentSupportRequest } from "@/src/services/support";
import { LifeBuoyIcon } from "./icons/NavbarIcons";

type Props = {
  onClose: () => void;
  /** Where the browser calls the API (`browserApiBaseUrl`), or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
};

type Failure = { message: string; signInUrl?: string };

const EMPTY: SupportRequestValues = { category: "", subject: "", message: "" };

/** Codes this app words itself; any other failure shows the API's own (localized) message. */
const CODE_MESSAGES: Record<string, string> = {
  SUPPORT_NOT_CONFIGURED: "errors.notConfigured",
  SUPPORT_REQUEST_NOT_SENT: "errors.notSent",
  INVALID_DATA_PROVIDED: "errors.invalid",
};

const inputClass = (invalid: boolean) =>
  `w-full rounded-lg border px-3 py-2 text-[12px] text-gray-900 outline-none transition-colors focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
    invalid
      ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
      : "border-gray-200 bg-white focus:border-blue-400 focus:ring-blue-400/20"
  }`;

/**
 * "Contact support" from the navbar: the user writes to Ability-Tech's support team, then
 * sees the reference the API gave the request and where the answer will go. Mounted only
 * while open, so every opening starts empty.
 */
export default function ContactSupportModal({ onClose, apiBaseUrl, portalBaseUrl }: Props) {
  const t = useTranslations("Support");
  const locale = useLocale();
  const pathname = usePathname();
  const titleId = useId();
  const firstFieldRef = useRef<HTMLSelectElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const [values, setValues] = useState<SupportRequestValues>(EMPTY);
  const [errors, setErrors] = useState<ReturnType<typeof toFieldErrors>>({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [sent, setSent] = useState<SentSupportRequest | null>(null);
  // A second click lands before React re-renders the disabled button.
  const inFlight = useRef(false);

  const schema = useMemo(
    () =>
      createSupportRequestSchema({
        categoryRequired: t("validation.categoryRequired"),
        subjectLength: t("validation.subjectLength", {
          min: SUPPORT_LIMITS.subjectMin,
          max: SUPPORT_LIMITS.subjectMax,
        }),
        subjectSingleLine: t("validation.subjectSingleLine"),
        messageLength: t("validation.messageLength", {
          min: SUPPORT_LIMITS.messageMin,
          max: SUPPORT_LIMITS.messageMax,
        }),
      }),
    [t],
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    (firstFieldRef.current ?? closeRef.current)?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !inFlight.current) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const close = () => {
    if (!inFlight.current) onClose();
  };

  const setField = (name: keyof SupportRequestValues, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const describeFailure = (error: unknown): Failure => {
    if (!(error instanceof ApiError)) return { message: t("errors.generic") };
    if (error.kind === "session_ended") {
      return {
        message: t("errors.sessionEnded"),
        signInUrl: portalBaseUrl
          ? buildPortalSignInUrl(portalBaseUrl, locale, window.location.href)
          : undefined,
      };
    }
    if (error.kind === "too_many_attempts") return { message: t("errors.tooManyRequests") };
    if (error.kind === "unreachable") return { message: t("errors.unreachable") };
    const key = error.code ? CODE_MESSAGES[error.code] : undefined;
    if (key) return { message: t(key) };
    return { message: error.serverMessage ?? t("errors.generic") };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inFlight.current || !apiBaseUrl) return;

    const result = schema.safeParse(values);
    if (!result.success) {
      setErrors(toFieldErrors(result.error.issues));
      return;
    }

    inFlight.current = true;
    setSending(true);
    setFailure(null);
    try {
      setSent(
        await sendSupportRequest(
          apiBaseUrl,
          buildSupportRequestPayload(result.data, pathname),
          locale,
        ),
      );
    } catch (error) {
      setFailure(describeFailure(error));
    } finally {
      inFlight.current = false;
      setSending(false);
    }
  };

  const fieldError = (name: keyof SupportRequestValues) => {
    const messages = errors[name];
    if (!messages?.length) return null;
    return (
      <p id={`support-${name}-error`} className="text-[11px] text-red-600">
        {messages[0]}
      </p>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-60 bg-black/20 backdrop-blur-xs" aria-hidden="true" />
      <div
        className="fixed inset-0 z-70 flex items-center justify-center overflow-y-auto p-4"
        onClick={close}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="my-auto w-full max-w-[520px] rounded-xl bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <LifeBuoyIcon className="h-4 w-4" />
              </span>
              <h2 id={titleId} className="text-[14px] font-semibold text-gray-900">
                {sent ? t("sentTitle") : t("title")}
              </h2>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              disabled={sending}
              aria-label={t("close")}
              title={t("close")}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          {sent ? (
            <div className="space-y-3 px-5 pb-5" role="status">
              <div className="flex items-start gap-2.5 rounded-lg bg-green-50 p-3 text-[12px] text-green-800">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <p>
                  {t.rich("sentReference", {
                    reference: sent.reference,
                    strong: (chunks) => (
                      <strong className="font-semibold" dir="ltr">
                        {chunks}
                      </strong>
                    ),
                  })}
                </p>
              </div>
              <p className={`text-[12px] ${sent.replyTo ? "text-gray-600" : "text-amber-700"}`}>
                {sent.replyTo
                  ? t.rich("sentReplyTo", {
                      email: sent.replyTo,
                      strong: (chunks) => (
                        <bdi className="font-medium text-gray-800">{chunks}</bdi>
                      ),
                    })
                  : t("sentNoEmail")}
              </p>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-full bg-blue-600 px-5 py-2 text-[11px] font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  {t("close")}
                </button>
              </div>
            </div>
          ) : !apiBaseUrl ? (
            <div className="px-5 pb-5">
              <p className="rounded-lg bg-amber-50 p-3 text-[12px] text-amber-800">
                {t("unavailable")}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-3 px-5 pb-4">
                <p className="text-[12px] text-gray-500">{t("intro")}</p>

                <div className="flex flex-col gap-1">
                  <label htmlFor="support-category" className="text-[11px] font-medium text-gray-600">
                    {t("category")}
                  </label>
                  <select
                    id="support-category"
                    ref={firstFieldRef}
                    value={values.category}
                    disabled={sending}
                    aria-invalid={Boolean(errors.category)}
                    aria-describedby={errors.category ? "support-category-error" : undefined}
                    onChange={(event) => setField("category", event.target.value)}
                    className={inputClass(Boolean(errors.category))}
                  >
                    <option value="" disabled>
                      {t("categoryPlaceholder")}
                    </option>
                    {SUPPORT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {t(`categories.${category}`)}
                      </option>
                    ))}
                  </select>
                  {fieldError("category")}
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="support-subject" className="text-[11px] font-medium text-gray-600">
                    {t("subject")}
                  </label>
                  <input
                    id="support-subject"
                    dir="auto"
                    value={values.subject}
                    maxLength={SUPPORT_LIMITS.subjectMax}
                    placeholder={t("subjectPlaceholder")}
                    disabled={sending}
                    aria-invalid={Boolean(errors.subject)}
                    aria-describedby={errors.subject ? "support-subject-error" : undefined}
                    onChange={(event) => setField("subject", event.target.value)}
                    className={inputClass(Boolean(errors.subject))}
                  />
                  {fieldError("subject")}
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="support-message" className="text-[11px] font-medium text-gray-600">
                    {t("message")}
                  </label>
                  <textarea
                    id="support-message"
                    dir="auto"
                    rows={6}
                    value={values.message}
                    maxLength={SUPPORT_LIMITS.messageMax}
                    placeholder={t("messagePlaceholder")}
                    disabled={sending}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={`support-message-count${errors.message ? " support-message-error" : ""}`}
                    onChange={(event) => setField("message", event.target.value)}
                    className={`${inputClass(Boolean(errors.message))} resize-y`}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div>{fieldError("message")}</div>
                    <p id="support-message-count" className="shrink-0 text-[10px] text-gray-400 tabular-nums">
                      {t("messageCounter", {
                        count: values.message.length,
                        max: SUPPORT_LIMITS.messageMax,
                      })}
                    </p>
                  </div>
                </div>

                {failure ? (
                  <div role="alert" className="rounded-lg bg-red-50 p-3 text-[12px] text-red-700">
                    <p>{failure.message}</p>
                    {failure.signInUrl ? (
                      <a
                        href={failure.signInUrl}
                        className="mt-1 inline-block font-medium text-red-800 underline underline-offset-2"
                      >
                        {t("signInAgain")}
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-5 py-3">
                <button
                  type="button"
                  onClick={close}
                  disabled={sending}
                  className="rounded-full border border-gray-200 bg-white px-5 py-2 text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  aria-busy={sending}
                  className="rounded-full bg-blue-600 px-5 py-2 text-[11px] font-medium text-white hover:bg-blue-700 transition-colors disabled:cursor-wait disabled:bg-blue-300"
                >
                  {sending ? t("sending") : t("send")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}
