import { z } from "zod";
import { apiPost } from "@/src/lib/apiClient";
import type { SupportRequestPayload } from "@/src/lib/supportRequest";

/**
 * Contact support (`POST /admin/support/requests`,
 * ability-crm-api/apps/community-admin/src/support): the API saves the request and mails it
 * to Ability-Tech's support team. Failures throw `ApiError` (src/lib/apiClient.ts):
 * `SUPPORT_NOT_CONFIGURED`, `SUPPORT_REQUEST_NOT_SENT`, `AUTH_TOO_MANY_ATTEMPTS`,
 * `INVALID_DATA_PROVIDED`, or a 401 when the session has ended.
 */
export type SentSupportRequest = {
  requestId: number;
  /** What the user quotes to support, e.g. SR-ACME-1042. */
  reference: string;
  /** Where the answer goes: the user's own email, or null when the account has none. */
  replyTo: string | null;
};

const sentSchema = z.object({
  request_id: z.number().int().positive(),
  reference: z.string().min(1),
  reply_to: z.string().min(1).nullable().optional(),
});

export function toSentSupportRequest(result: unknown): SentSupportRequest {
  const parsed = sentSchema.safeParse(result);
  if (!parsed.success) {
    throw new Error("The support request answer is missing its reference");
  }
  return {
    requestId: parsed.data.request_id,
    reference: parsed.data.reference,
    replyTo: parsed.data.reply_to ?? null,
  };
}

export async function sendSupportRequest(
  apiBaseUrl: string,
  payload: SupportRequestPayload,
  locale: string,
): Promise<SentSupportRequest> {
  const result = await apiPost(apiBaseUrl, "/support/requests", payload, { locale });
  return toSentSupportRequest(result);
}
