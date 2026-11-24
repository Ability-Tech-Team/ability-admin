"use client";

import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import Pagination from "@/src/components/Pagination";
import { useDeliveryLogsPage } from "../hooks/useDeliveryLogsPage";
import DeliveryLogsTable, { type DeliveryLogsLabels } from "./DeliveryLogsTable";

type Props = {
  labels: DeliveryLogsLabels;
  /** Where the browser calls the API, or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
};

/** Each send with its recipients, push results and read rate, paged by the API. */
export default function DeliveryLogsPageClient({ labels, apiBaseUrl, portalBaseUrl }: Props) {
  const { page, setPage, list } = useDeliveryLogsPage({ apiBaseUrl, portalBaseUrl });

  return (
    <>
      {list.failure && <ApiFailureNotice failure={list.failure} onRetry={list.reload} className="mx-5" />}
      <DeliveryLogsTable labels={labels} data={list.data} loading={list.loading} />
      {/* Shown only when there is more than one page. */}
      {list.data && (
        <div className="px-5">
          <Pagination page={page} totalPages={list.data.totalPages} onPageChange={setPage} disabled={list.loading} />
        </div>
      )}
    </>
  );
}
