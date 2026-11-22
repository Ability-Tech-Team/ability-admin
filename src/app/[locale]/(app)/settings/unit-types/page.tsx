import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { fetchUnitTypes } from "@/src/services/unitTypes";
import UnitTypesPageClient from "./components/UnitTypesPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function UnitTypesPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("Settings.unitTypes");
  const data = await fetchUnitTypes();

  return (
    <UnitTypesPageClient
      data={data}
      labels={{
        addUnitType: t("addUnitType"),
        unitType: t("unitType"),
        arabicName: t("arabicName"),
        defaultAnnualRent: t("defaultAnnualRent"),
        status: t("status"),
        active: t("active"),
        inactive: t("inactive"),
        nameEn: t("nameEn"),
        nameAr: t("nameAr"),
        rent: t("rent"),
        save: t("save"),
        cancel: t("cancel"),
        added: t("added"),
      }}
    />
  );
}
