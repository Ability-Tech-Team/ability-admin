import { getTranslations } from "next-intl/server";
import PageHeader from "@/src/components/PageHeader";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import UsersPermissionsTabs from "./components/UsersPermissionsTabs";

type Props = {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
};

export default async function UsersPermissionsLayout({ params, children }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("UsersPermissions");
  const tSide = await getTranslations("SideMenu");

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <PageHeader
        breadcrumbs={[
          { label: tSide("adminPanel"), href: "/" },
          { label: tSide("usersPermissions") },
        ]}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <UsersPermissionsTabs />
      {children}
    </div>
  );
}
