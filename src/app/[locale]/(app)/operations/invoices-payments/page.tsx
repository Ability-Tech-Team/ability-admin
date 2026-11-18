import { getTranslations } from "next-intl/server";
import InvoiceSummaryCards from "./components/InvoiceSummaryCards";
import InvoicesPageClient from "./components/InvoicesPageClient";
import { fetchInvoiceStats, fetchInvoices, fetchMaintenanceDeposits } from "@/src/services/invoices";
import { fetchProjectFilterOptions } from "@/src/services/projects";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function InvoicesPaymentsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("Operations");
  const [stats, invoices, depositData, projectOptions] = await Promise.all([
    fetchInvoiceStats(),
    fetchInvoices(),
    fetchMaintenanceDeposits(),
    fetchProjectFilterOptions(),
  ]);

  return (
    <>
      <InvoiceSummaryCards stats={stats} />
      <InvoicesPageClient
        data={invoices}
        depositData={depositData}
        projectOptions={projectOptions}
        labels={{
          searchPlaceholder: t("searchInvoices"),
          exactSearch: t("exactSearch"),
          status: t("status"),
          export: t("export"),
          addLabel: t("invoice.generateInvoice"),
        }}
      />
    </>
  );
}
