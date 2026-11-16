import { getTranslations } from "next-intl/server";
import Toolbar from "@/src/components/Toolbar";
import RentalsTable from "./components/RentalsTable";
import RentalFilters, { PrintRCButton } from "./components/RentalFilters";
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
    <>
      <Toolbar
        labels={{
          searchPlaceholder: t("searchRentals"),
          exactSearch: t("exactSearch"),
          status: t("status"),
          export: t("export"),
          import: t("import"),
          addLabel: t("addRental"),
        }}
        leadingContent={<PrintRCButton />}
        extraFilters={<RentalFilters />}
      />
      <div className="px-5">
        <RentalsTable data={rentals} />
      </div>
    </>
  );
}
