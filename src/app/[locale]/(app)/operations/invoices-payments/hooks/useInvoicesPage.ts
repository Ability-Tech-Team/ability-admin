"use client";

import { useCallback, useMemo, useState } from "react";
import { saveFile } from "@/src/hooks/useApiDownload";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { useDropdowns } from "@/src/hooks/useDropdowns";
import {
  downloadInvoicesSheet,
  fetchInvoiceStats,
  fetchInvoices,
  payInvoice,
  type Invoice,
  type InvoiceFilters,
  type PaymentMethodKey,
} from "@/src/services/invoices";
import { fetchProjectOptions } from "@/src/services/projects";

type Options = {
  /** Where the browser calls the API, or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
};

/** Invoices per page. */
export const INVOICES_PAGE_SIZE = 10;

/**
 * The Invoices & Payments screen: the filtered, paged list and its figures, the project and
 * invoice-type filters' options, recording a payment ("Mark paid"), opening Generate Invoice
 * (its form is `useGenerateInvoice`), and the Excel export.
 */
export function useInvoicesPage({ apiBaseUrl, portalBaseUrl }: Options) {
  const [search, setSearchText] = useState("");
  const [isExact, setIsExactValue] = useState(false);
  const [statusId, setStatusIdValue] = useState<number | null>(null);
  const [projectId, setProjectIdValue] = useState<number | null>(null);
  const [invoiceTypeId, setInvoiceTypeIdValue] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search);
  const filters = useMemo<InvoiceFilters>(
    () => ({ search: debouncedSearch, isExact, statusId, projectId, invoiceTypeId }),
    [debouncedSearch, isExact, statusId, projectId, invoiceTypeId],
  );
  const filtersKey = JSON.stringify(filters);

  const list = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: `${filtersKey}|${page}`,
    load: ({ apiBaseUrl: base, locale }) =>
      fetchInvoices(base, filters, page, INVOICES_PAGE_SIZE, locale),
  });

  const stats = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: filtersKey,
    load: ({ apiBaseUrl: base, locale }) => fetchInvoiceStats(base, filters, locale),
  });

  // The employee's projects; the project filter stays hidden while there are none.
  const projects = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: "projects",
    load: ({ apiBaseUrl: base, locale }) => fetchProjectOptions(base, { activeOnly: false }, locale),
  });

  // The chosen project's invoice types, for the type filter (shown once a project is chosen).
  const projectDropdowns = useDropdowns({ apiBaseUrl, portalBaseUrl, projectId, enabled: projectId !== null });

  // Every filter change starts again at page 1.
  const setSearch = useCallback((value: string) => {
    setSearchText(value);
    setPage(1);
  }, []);
  const setIsExact = useCallback((value: boolean) => {
    setIsExactValue(value);
    setPage(1);
  }, []);
  const setStatusId = useCallback((value: number | null) => {
    setStatusIdValue(value);
    setPage(1);
  }, []);
  // Another project has other invoice types, so changing it clears the type.
  const setProjectId = useCallback((value: number | null) => {
    setProjectIdValue(value);
    setInvoiceTypeIdValue(null);
    setPage(1);
  }, []);
  const setInvoiceTypeId = useCallback((value: number | null) => {
    setInvoiceTypeIdValue(value);
    setPage(1);
  }, []);

  // Mark paid

  const payment = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [paidInvoiceNumber, setPaidInvoiceNumber] = useState<string | null>(null);

  const { reset: resetPayment, run: runPayment } = payment;
  const { reload: reloadList } = list;
  const { reload: reloadStats } = stats;

  const openPayment = useCallback(
    (invoice: Invoice) => {
      resetPayment();
      setPaidInvoiceNumber(null);
      setPayingInvoice(invoice);
    },
    [resetPayment],
  );

  const closePayment = useCallback(() => {
    if (payment.pending) return;
    setPayingInvoice(null);
  }, [payment.pending]);

  const recordPayment = useCallback(
    async (details: { amount: number; paymentMethod: PaymentMethodKey; referenceNumber: string }) => {
      if (!payingInvoice) return;
      const invoice = payingInvoice;
      const done = await runPayment(async ({ apiBaseUrl: base, locale }) => {
        await payInvoice(base, { invoice, ...details }, locale);
        return true;
      });
      if (done) {
        setPayingInvoice(null);
        setPaidInvoiceNumber(invoice.invoiceNumber);
        reloadList();
        reloadStats();
      }
    },
    [payingInvoice, runPayment, reloadList, reloadStats],
  );

  // Generate Invoice

  const [generating, setGenerating] = useState(false);
  const [createdInvoiceNumber, setCreatedInvoiceNumber] = useState<string | null>(null);

  const openGenerate = useCallback(() => {
    setCreatedInvoiceNumber(null);
    setGenerating(true);
  }, []);
  const closeGenerate = useCallback(() => setGenerating(false), []);
  const invoiceCreated = useCallback(
    (invoiceNumber: string) => {
      setGenerating(false);
      setCreatedInvoiceNumber(invoiceNumber);
      reloadList();
      reloadStats();
    },
    [reloadList, reloadStats],
  );

  // Export

  const exporting = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const { run: runExport } = exporting;

  const exportSheet = useCallback(async () => {
    const sheet = await runExport(({ apiBaseUrl: base, locale }) =>
      downloadInvoicesSheet(base, filters, locale),
    );
    if (sheet) saveFile(sheet);
  }, [runExport, filters]);

  return {
    filters: { search, isExact, statusId, projectId, invoiceTypeId },
    setSearch,
    setIsExact,
    setStatusId,
    setProjectId,
    setInvoiceTypeId,
    page,
    setPage,
    list,
    stats,
    projectOptions: projects.data,
    /** The chosen project's invoice types; null while none is chosen, loading, or after a failure. */
    // While another project's types load, the previous project's are not offered.
    invoiceTypeOptions:
      projectId !== null && !projectDropdowns.loading ? (projectDropdowns.data?.invoiceTypes ?? null) : null,
    invoiceTypesFailure: projectId !== null ? projectDropdowns.failure : null,
    reloadInvoiceTypes: projectDropdowns.reload,
    generate: {
      isOpen: generating,
      open: openGenerate,
      close: closeGenerate,
      created: invoiceCreated,
      createdInvoiceNumber,
      dismissCreated: () => setCreatedInvoiceNumber(null),
    },
    payment: {
      invoice: payingInvoice,
      open: openPayment,
      close: closePayment,
      submit: recordPayment,
      pending: payment.pending,
      failure: payment.failure,
      paidInvoiceNumber,
      dismissPaid: () => setPaidInvoiceNumber(null),
    },
    exportSheet,
    exportPending: exporting.pending,
    exportFailure: exporting.failure,
  };
}
