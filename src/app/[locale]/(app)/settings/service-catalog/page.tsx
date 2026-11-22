import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { fetchServiceCatalog, fetchServiceCatalogDepartmentOptions, fetchServiceCatalogStatusOptions } from "@/src/services/serviceCatalog";
import ServiceCatalogPageClient from "./components/ServiceCatalogPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ServiceCatalogPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("Settings.serviceCatalog");
  const [data, departmentOptions, statusOptions] = await Promise.all([
    fetchServiceCatalog(),
    fetchServiceCatalogDepartmentOptions(),
    fetchServiceCatalogStatusOptions(),
  ]);

  return (
    <ServiceCatalogPageClient
      data={data}
      departmentOptions={departmentOptions}
      statusOptions={statusOptions}
      labels={{
        searchPlaceholder: t("searchPlaceholder"),
        exactSearch: t("exactSearch"),
        departments: t("departments"),
        status: t("status"),
        addService: t("addService"),
        baseCost: t("baseCost"),
        serviceName: t("serviceName"),
        department: t("department"),
        description: t("description"),
        baseCostLabel: t("baseCostLabel"),
        save: t("save"),
        cancel: t("cancel"),
        added: t("added"),
      }}
    />
  );
}
