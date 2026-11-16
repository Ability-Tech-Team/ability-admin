import { getTranslations } from "next-intl/server";
import Toolbar from "@/src/components/Toolbar";
import FamilyMembersTable from "./components/FamilyMembersTable";
import FamilyMemberFilters from "./components/FamilyMemberFilters";
import { fetchFamilyMembers } from "@/src/services/familyMembers";
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
  const members = await fetchFamilyMembers();

  return (
    <>
      <Toolbar
        labels={{
          searchPlaceholder: t("searchMembers"),
          exactSearch: t("exactSearch"),
          status: t("status"),
          export: t("export"),
          import: t("import"),
          addLabel: t("addMember"),
        }}
        extraFilters={<FamilyMemberFilters />}
      />
      <div className="px-5">
        <FamilyMembersTable data={members} />
      </div>
    </>
  );
}
