import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { fetchRoles } from "@/src/services/roles";
import RolesPageClient from "./components/RolesPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RolesPermissionsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const roles = await fetchRoles();
  const t = await getTranslations("UsersPermissions.rolesPage");

  return (
    <RolesPageClient
      roles={roles}
      labels={{
        addRole: t("addRole"),
        rolesTitle: t("rolesTitle"),
        permissionMatrix: t("permissionMatrix"),
        usersWithRole: t("usersWithRole"),
        saveChanges: t("saveChanges"),
        module: t("columns.module"),
        view: t("columns.view"),
        create: t("columns.create"),
        edit: t("columns.edit"),
        delete: t("columns.delete"),
        approve: t("columns.approve"),
        permissionsSaved: t("permissionsSaved"),
      }}
    />
  );
}
