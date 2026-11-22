import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { fetchDepartments } from "@/src/services/departments";
import DepartmentsPageClient from "./components/DepartmentsPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DepartmentsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("Settings.departments");
  const departments = await fetchDepartments();

  return (
    <DepartmentsPageClient
      data={departments}
      labels={{
        addDepartment: t("addDepartment"),
        head: t("head"),
        staff: t("staff"),
        active: t("active"),
        inactive: t("inactive"),
        added: t("added"),
        nameEn: t("nameEn"),
        nameAr: t("nameAr"),
        headLabel: t("headLabel"),
        save: t("save"),
        cancel: t("cancel"),
      }}
    />
  );
}
