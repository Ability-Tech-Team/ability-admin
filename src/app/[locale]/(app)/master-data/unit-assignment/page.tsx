import { getTranslations } from "next-intl/server";
import UnitAssignmentPageClient from "./components/UnitAssignmentPageClient";
import { fetchUnitAssignments } from "@/src/services/unitAssignments";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function UnitAssignmentPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("MasterData");
  const assignments = await fetchUnitAssignments();

  return (
    <UnitAssignmentPageClient
      data={assignments}
      labels={{
        searchPlaceholder: t("searchAssignments"),
        exactSearch: t("exactSearch"),
        status: t("status"),
        addLabel: "",
      }}
    />
  );
}
