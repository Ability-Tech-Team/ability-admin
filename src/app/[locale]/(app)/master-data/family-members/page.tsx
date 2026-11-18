import { getTranslations } from "next-intl/server";
import FamilyMembersPageClient from "./components/FamilyMembersPageClient";
import { fetchFamilyMembers } from "@/src/services/familyMembers";
import { fetchProjectFilterOptions } from "@/src/services/projects";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function FamilyMembersPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("MasterData");
  const [members, projectOptions] = await Promise.all([
    fetchFamilyMembers(),
    fetchProjectFilterOptions(),
  ]);

  return (
    <FamilyMembersPageClient
      data={members}
      projectOptions={projectOptions}
      labels={{
        searchPlaceholder: t("searchMembers"),
        exactSearch: t("exactSearch"),
        status: t("status"),
        export: t("export"),
        import: t("import"),
        addLabel: t("addMember"),
      }}
    />
  );
}
