"use client";

import { useLocale, useTranslations } from "next-intl";
import DetailPanel from "@/src/components/DetailPanel";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import type { ApiFailure } from "@/src/lib/apiFailure";
import {
  reservationActions,
  walkInActions,
  type RentalAttachment,
  type RentalRelative,
  type RentalTenant,
  type ReservationDetail,
  type WalkInDetail,
} from "@/src/services/rentals";
import type { RentalDialog, RentalDialogMode } from "../types";
import { formatAmount } from "../utils";
import StatusBadge from "./StatusBadge";

type Props = {
  detail:
    | { kind: "reservations"; data: ReservationDetail | null }
    | { kind: "walkIns"; data: WalkInDetail | null };
  loading: boolean;
  failure: ApiFailure | null;
  onRetry: () => void;
  busy: boolean;
  onAction: (dialog: RentalDialog) => void;
  onClose: () => void;
};

type Fact = { label: string; value: string | null };

export default function RentalDetail({ detail, loading, failure, onRetry, busy, onAction, onClose }: Props) {
  const t = useTranslations("MasterData");
  const tRentals = useTranslations("RentalsScreen");
  const locale = useLocale();

  const data = detail.data;
  const period = (start: string | null, end: string | null) =>
    start ? tRentals("detail.period", { start, end: end ?? "—" }) : "—";

  let facts: Fact[] = [];
  let modes: RentalDialogMode[] = [];
  if (detail.kind === "reservations" && detail.data) {
    const reservation = detail.data;
    facts = [
      { label: tRentals("detail.rentalCompany"), value: reservation.rentalCompanyName },
      { label: tRentals("detail.signDate"), value: reservation.signDate },
      { label: tRentals("detail.accessCard"), value: reservation.accessCardNumber },
      { label: tRentals("detail.totalTenants"), value: reservation.totalTenantCount?.toString() ?? null },
      { label: t("rentalColumns.source"), value: reservation.sourceName },
      { label: tRentals("detail.rating"), value: reservation.tenantRating?.toString() ?? null },
      { label: tRentals("detail.terminationReason"), value: reservation.terminationReason },
      {
        label: tRentals("detail.penalty"),
        value: reservation.penaltyAmount !== null ? formatAmount(reservation.penaltyAmount, locale) : null,
      },
      { label: tRentals("detail.notes"), value: reservation.notes },
    ];
    const allowed = reservationActions(reservation.statusId);
    modes = (["checkIn", "extend", "checkOut", "terminate", "cancel"] as const).filter((mode) => allowed[mode]);
  } else if (detail.kind === "walkIns" && detail.data) {
    const request = detail.data;
    facts = [
      { label: t("rentalColumns.source"), value: request.sourceName },
      { label: tRentals("detail.rentalCompany"), value: request.rentalCompanyName },
      {
        label: tRentals("detail.delegate"),
        value: request.delegate
          ? [request.delegate.name, request.delegate.phoneNumber].filter(Boolean).join(" · ") || null
          : null,
      },
      { label: tRentals("detail.accessCard"), value: request.accessCardNumber },
      { label: tRentals("detail.totalTenants"), value: request.totalTenantCount?.toString() ?? null },
      { label: tRentals("detail.rejectReason"), value: request.rejectReason },
      { label: tRentals("detail.notes"), value: request.notes },
    ];
    const allowed = walkInActions(request.statusId);
    modes = (["accept", "reject"] as const).filter((mode) => allowed[mode]);
  }

  return (
    <DetailPanel
      title={`${t("rentalDetail.tenantsOn")} ${data ? [data.projectName, data.unitNumber].filter(Boolean).join(" – ") : "…"}`}
      onClose={onClose}
      width="w-[480px] max-w-full"
      closeLabel={tRentals("detail.close")}
    >
        <div className="flex flex-col gap-4 p-5">
          {failure && <ApiFailureNotice failure={failure} onRetry={onRetry} />}
          {!data && loading && <p className="text-[12px] text-gray-400">{tRentals("detail.loading")}</p>}

          {data && (
            <>
              <TenantCard
                tenant={data.tenant}
                badge={<StatusBadge kind={detail.kind} statusId={data.statusId} statusName={data.statusName} />}
                subtitle={period(data.startDate, data.endDate)}
              />

              {modes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {modes.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        onAction({
                          mode,
                          target: { id: data.id, tenantName: data.tenant.name, unitNumber: data.unitNumber },
                        })
                      }
                      className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors disabled:opacity-50 ${
                        mode === "cancel" || mode === "terminate" || mode === "reject"
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {mode === "accept"
                        ? t("familyColumns.approve")
                        : mode === "reject"
                          ? t("familyColumns.reject")
                          : tRentals(`actions.${mode}`)}
                    </button>
                  ))}
                </div>
              )}

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-gray-200 p-4">
                {facts.map((fact) => (
                  <div key={fact.label} className="min-w-0">
                    <dt className="text-[10px] text-gray-400">{fact.label}</dt>
                    <dd className="break-words text-[11px] text-gray-900">{fact.value || "—"}</dd>
                  </div>
                ))}
              </dl>

              {data.relatives.length > 0 && (
                <section className="flex flex-col gap-2">
                  <h3 className="text-[12px] font-semibold text-gray-900">{tRentals("detail.relatives")}</h3>
                  {data.relatives.map((relative) => (
                    <RelativeCard key={relative.id} relative={relative} />
                  ))}
                </section>
              )}

              <Attachments attachments={data.attachments} />
            </>
          )}
        </div>
    </DetailPanel>
  );
}

function TenantCard({ tenant, badge, subtitle }: { tenant: RentalTenant; badge: React.ReactNode; subtitle: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="mb-1 flex items-start justify-between gap-2">
        <p className="text-[12px] font-semibold text-gray-900">{tenant.name}</p>
        {badge}
      </div>
      <p className="text-[11px] text-gray-400">
        {[tenant.idType?.name, tenant.idNumber].filter(Boolean).join(" · ")} · {subtitle}
      </p>
      {(tenant.mobileNumber || tenant.email) && (
        <p className="mt-1 text-[11px] text-gray-500">
          {[tenant.mobileNumber, tenant.email].filter(Boolean).join(" · ")}
        </p>
      )}
    </div>
  );
}

function RelativeCard({ relative }: { relative: RentalRelative }) {
  return (
    <div className="rounded-lg border border-gray-100 px-4 py-3">
      <p className="text-[11px] font-semibold text-gray-900">
        {relative.name}
        {relative.relation && <span className="ms-1 font-normal text-gray-400">({relative.relation})</span>}
      </p>
      <p className="text-[11px] text-gray-400">
        {[relative.idType?.name, relative.idNumber, relative.mobileNumber].filter(Boolean).join(" · ")}
      </p>
    </div>
  );
}

function Attachments({ attachments }: { attachments: RentalAttachment[] }) {
  const t = useTranslations("MasterData");
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-[12px] font-semibold text-gray-900">{t("attachmentsTitle")}</h3>
      {attachments.length === 0 ? (
        <p className="text-[11px] text-gray-400">{t("noAttachments")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold text-gray-900">{attachment.fileName}</p>
                {(attachment.description || attachment.ownerName) && (
                  <p className="truncate text-[10px] text-gray-400">
                    {[attachment.ownerName, attachment.description].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-md border border-gray-200 px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t("open")}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
