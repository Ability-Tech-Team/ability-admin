import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { fetchUsers } from "@/src/services/users";
import { fetchProjectFilterOptions } from "@/src/services/projects";
import UsersPageClient from "./components/UsersPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function UsersPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const [data, projectOptions] = await Promise.all([
    fetchUsers(),
    fetchProjectFilterOptions(),
  ]);
  const t = await getTranslations("UsersPermissions");

  return (
    <UsersPageClient
      data={data}
      projectOptions={projectOptions}
      labels={{
        searchPlaceholder: t("searchPlaceholder"),
        exactSearch: t("exactSearch"),
        status: t("status"),
        addLabel: t("inviteUser"),
      }}
    />
  );
}
