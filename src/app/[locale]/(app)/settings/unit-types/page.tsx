import { getTranslations } from "next-intl/server";
import { fetchUnitTypes } from "@/src/services/unitTypes";
import UnitTypesPageClient from "./components/UnitTypesPageClient";

export default async function UnitTypesPage() {
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
