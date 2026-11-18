import { getTranslations } from "next-intl/server";
import StatusCards from "../components/StatusCards";
import ServiceRequestsPageClient from "./components/ServiceRequestsPageClient";
import { fetchServiceRequestStats, fetchServiceRequests } from "@/src/services/serviceRequests";
import { fetchProjectFilterOptions } from "@/src/services/projects";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ServiceRequestsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("Operations");
  const [stats, requests, projectOptions] = await Promise.all([
    fetchServiceRequestStats(),
    fetchServiceRequests(),
    fetchProjectFilterOptions(),
  ]);

  return (
    <>
      <StatusCards stats={stats} />
      <ServiceRequestsPageClient
        data={requests}
        projectOptions={projectOptions}
        labels={{
          searchPlaceholder: t("searchRequests"),
          exactSearch: t("exactSearch"),
          status: t("status"),
          export: t("export"),
          addLabel: t("newRequest"),
        }}
      />
    </>
  );
}
