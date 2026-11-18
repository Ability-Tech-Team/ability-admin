import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { fetchPhoneContacts } from "@/src/services/phoneDirectory";
import PhoneDirectoryPageClient from "./components/PhoneDirectoryPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PhoneDirectoryPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("EventsContent");
  const contacts = await fetchPhoneContacts();

  return (
    <PhoneDirectoryPageClient
      data={contacts}
      labels={{
        searchPlaceholder: t("phoneDir.searchPlaceholder"),
        exactSearch: t("phoneDir.exactSearch"),
        status: t("status"),
        addLabel: t("phoneDir.addContact"),
      }}
    />
  );
}
