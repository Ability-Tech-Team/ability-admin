"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import Pagination from "@/src/components/Pagination";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import { useGuestInvitationsPage } from "../hooks/useGuestInvitationsPage";
import type { GuestInvitation } from "../types";
import CreateGuestInvitationModal from "./CreateGuestInvitationModal";
import GuestInvitationDetail from "./GuestInvitationDetail";
import GuestInvitationsTable from "./GuestInvitationsTable";
import GuestInvitationsToolbar from "./GuestInvitationsToolbar";
import GuestSummaryCards from "./GuestSummaryCards";

type Props = {
  /** Where the browser calls the API, or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  labels: ToolbarLabels;
};

/** Guest invitations, loaded page by page from the API in the browser, with their counts. */
export default function GuestInvitationsPageClient({ apiBaseUrl, portalBaseUrl, labels }: Props) {
  const tc = useTranslations("CustomersScreen");
  const page = useGuestInvitationsPage({ apiBaseUrl, portalBaseUrl });
  const [selected, setSelected] = useState<GuestInvitation | null>(null);
  const [creating, setCreating] = useState(false);
  const { data, loading, failure, reload } = page.list;

  return (
    <>
      <GuestSummaryCards counts={page.counts.data} />
      <GuestInvitationsToolbar
        labels={labels}
        onStatusChange={page.setStatuses}
        onSearch={page.setSearch}
        onExactSearchChange={page.setExact}
        onAdd={() => {
          page.formAction.reset();
          setCreating(true);
        }}
      />
      {(page.severalTicked || failure) && (
        <div className="flex flex-col gap-3 px-5">
          {page.severalTicked && <p className="text-[11px] text-amber-700" role="status">{tc("oneChoiceHint")}</p>}
          {failure && <ApiFailureNotice failure={failure} onRetry={reload} />}
        </div>
      )}
      <div aria-busy={loading || undefined} className={loading && data ? "opacity-60 transition-opacity" : undefined}>
        <GuestInvitationsTable
          invitations={data?.invitations ?? []}
          loading={loading}
          onView={(invitation) => {
            page.statusAction.reset();
            setSelected(invitation);
            page.open(invitation.id);
          }}
          footer={
            data && (
              <Pagination
                page={page.page}
                totalPages={data.totalPages}
                totalCount={data.totalCount}
                onPageChange={page.setPage}
                disabled={loading}
              />
            )
          }
        />
      </div>

      {selected && (
        <GuestInvitationDetail
          invitation={selected}
          detail={page.detail}
          onSetActive={(active) => page.setActive(selected.id, active)}
          pending={page.statusAction.pending}
          failure={page.statusAction.failure}
          onClose={() => {
            setSelected(null);
            page.close();
          }}
        />
      )}

      {creating && (
        <CreateGuestInvitationModal
          apiBaseUrl={apiBaseUrl}
          portalBaseUrl={portalBaseUrl}
          onCreate={page.create}
          saving={page.formAction.pending}
          failure={page.formAction.failure}
          onClose={() => setCreating(false)}
        />
      )}
    </>
  );
}
