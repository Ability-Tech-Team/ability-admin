import { getTranslations } from "next-intl/server";
import { fetchServiceCatalog, fetchServiceCatalogDepartmentOptions, fetchServiceCatalogStatusOptions } from "@/src/services/serviceCatalog";
import ServiceCatalogPageClient from "./components/ServiceCatalogPageClient";

export default async function ServiceCatalogPage() {
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
