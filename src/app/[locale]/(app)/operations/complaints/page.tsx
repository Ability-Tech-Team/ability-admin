import { getTranslations } from "next-intl/server";
import ComplaintsPageClient from "./components/ComplaintsPageClient";
import { fetchComplaints } from "@/src/services/complaints";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ComplaintsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("Operations");
  const complaints = await fetchComplaints();

  return (
    <ComplaintsPageClient
      data={complaints}
      labels={{
        searchPlaceholder: t("searchComplaints"),
        exactSearch: t("exactSearch"),
        status: t("status"),
        addLabel: t("newComplaint"),
      }}
    />
  );
}
