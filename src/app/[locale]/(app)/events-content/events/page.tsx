import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { fetchEvents } from "@/src/services/events";
import { fetchProjectFilterOptions } from "@/src/services/projects";
import EventsPageClient from "./components/EventsPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function EventsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("EventsContent");
  const [events, projectOptions] = await Promise.all([
    fetchEvents(),
    fetchProjectFilterOptions(),
  ]);

  return (
    <EventsPageClient
      data={events}
      projectOptions={projectOptions}
      labels={{
        searchPlaceholder: t("searchPlaceholder"),
        exactSearch: t("exactSearch"),
        status: t("status"),
        addLabel: t("newEvent"),
      }}
    />
  );
}
