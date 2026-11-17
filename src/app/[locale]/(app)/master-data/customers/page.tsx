import { getTranslations } from "next-intl/server";
import CustomersPageClient from "./components/CustomersPageClient";
import { fetchCustomers } from "@/src/services/customers";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CustomersPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("MasterData");
  const customers = await fetchCustomers();

  return (
    <CustomersPageClient
      data={customers}
      labels={{
        searchPlaceholder: t("searchCustomers"),
        exactSearch: t("exactSearch"),
        status: t("status"),
        export: t("export"),
        import: t("import"),
        addLabel: t("addCustomer"),
      }}
    />
  );
}
