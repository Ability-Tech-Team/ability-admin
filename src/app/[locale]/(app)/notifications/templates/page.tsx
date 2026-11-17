import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { fetchNotificationTemplates } from "@/src/services/notificationTemplates";
import TemplatesPageClient from "./components/TemplatesPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TemplatesPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("Notifications");
  const templates = await fetchNotificationTemplates();

  return (
    <TemplatesPageClient
      templates={templates}
      labels={{
        newTemplate: t("templates.newTemplate"),
        edit: t("templates.edit"),
        useTemplate: t("templates.useTemplate"),
        uses: t("templates.uses"),
      }}
    />
  );
}
