"use client";

import { useTranslations } from "next-intl";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import Pagination from "@/src/components/Pagination";
import { useInvoicesPage } from "../hooks/useInvoicesPage";
import InvoiceSummaryCards from "./InvoiceSummaryCards";
import InvoiceToolbar from "./InvoiceToolbar";
import InvoicesTable from "./InvoicesTable";
import RecordPaymentModal from "./RecordPaymentModal";

type Props = {
  /** Where the browser calls the API, or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
};

export default function InvoicesPageClient({ apiBaseUrl, portalBaseUrl }: Props) {
  const t = useTranslations("InvoicesScreen");
  const page = useInvoicesPage({ apiBaseUrl, portalBaseUrl });
  const { list, stats, payment } = page;

  return (
    <>
      {stats.failure && list.failure?.reason !== stats.failure.reason && (
        <ApiFailureNotice failure={stats.failure} onRetry={stats.reload} className="mx-5" />
      )}
      <InvoiceSummaryCards stats={stats.data} loading={stats.loading} />

      <InvoiceToolbar
        search={page.filters.search}
        isExact={page.filters.isExact}
        statusId={page.filters.statusId}
        projectId={page.filters.projectId}
        onSearchChange={page.setSearch}
        onExactChange={page.setIsExact}
        onStatusChange={page.setStatusId}
        onProjectChange={page.setProjectId}
        projectOptions={page.projectOptions}
        onExport={page.exportSheet}
        exportPending={page.exportPending}
      />

      {page.exportFailure && (
        <ApiFailureNotice failure={page.exportFailure} className="mx-5" />
      )}

      {payment.paidInvoiceNumber && (
        <div
          role="status"
          className="mx-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] text-emerald-800"
        >
          <span>{t("payment.success", { number: payment.paidInvoiceNumber })}</span>
          <button
            type="button"
            onClick={payment.dismissPaid}
            className="rounded-lg bg-white px-3 py-1.5 font-semibold text-emerald-800 shadow-sm hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {t("dismiss")}
          </button>
        </div>
      )}

      {list.failure && <ApiFailureNotice failure={list.failure} onRetry={list.reload} className="mx-5" />}

      <InvoicesTable
        invoices={list.data?.invoices ?? null}
        loading={list.loading}
        onRecordPayment={payment.open}
        paymentPending={payment.pending}
        footer={
          list.data && (
            <Pagination
              page={page.page}
              totalPages={list.data.totalPages}
              totalCount={list.data.totalCount}
              onPageChange={page.setPage}
              disabled={list.loading}
            />
          )
        }
      />

      {payment.invoice && (
        <RecordPaymentModal
          invoice={payment.invoice}
          pending={payment.pending}
          failure={payment.failure}
          onSubmit={payment.submit}
          onClose={payment.close}
        />
      )}
    </>
  );
}
