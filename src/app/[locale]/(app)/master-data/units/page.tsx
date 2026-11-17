import { getTranslations } from "next-intl/server";
import UnitsPageClient from "./components/UnitsPageClient";
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
    <UnitsPageClient
      data={units}
      labels={{
        searchPlaceholder: t("searchUnits"),
        exactSearch: t("exactSearch"),
        status: t("status"),
        export: t("export"),
        import: t("import"),
        addLabel: t("addUnit"),
      }}
    />
  );
}
