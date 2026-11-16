import { getTranslations } from "next-intl/server";
import Toolbar from "@/src/components/Toolbar";
import ContractFilter from "./components/ContractFilter";
import UnitsTable from "./components/UnitsTable";
import { fetchUnits } from "@/src/services/units";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function UnitsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("MasterData");
  const units = await fetchUnits();

  return (
    <>
      <Toolbar
        labels={{
          searchPlaceholder: t("searchUnits"),
          exactSearch: t("exactSearch"),
          status: t("status"),
          export: t("export"),
          import: t("import"),
          addLabel: t("addUnit"),
        }}
        extraFilters={<ContractFilter />}
      />
      <div className="px-5">
        <UnitsTable data={units} />
      </div>
    </>
  );
}
