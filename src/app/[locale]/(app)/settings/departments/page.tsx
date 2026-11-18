import { getTranslations } from "next-intl/server";
import { fetchDepartments } from "@/src/services/departments";
import DepartmentsPageClient from "./components/DepartmentsPageClient";

export default async function DepartmentsPage() {
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
