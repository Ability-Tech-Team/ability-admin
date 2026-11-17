import { getTranslations } from "next-intl/server";
import RentalManagementPageClient from "./components/RentalManagementPageClient";
import { fetchRentals } from "@/src/services/rentals";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RentalManagementPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("MasterData");
  const rentals = await fetchRentals();

  return (
    <RentalManagementPageClient
      data={rentals}
      labels={{
        searchPlaceholder: t("searchRentals"),
        exactSearch: t("exactSearch"),
        status: t("status"),
        export: t("export"),
        import: t("import"),
        addLabel: t("addRental"),
      }}
    />
  );
}
