import { getTranslations } from "next-intl/server";
import PageHeader from "@/src/components/PageHeader";
import EventsContentTabs from "./components/EventsContentTabs";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";

type Props = {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
};

export default async function EventsContentLayout({ params, children }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("EventsContent");
  const tSide = await getTranslations("SideMenu");

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <PageHeader
        breadcrumbs={[
          { label: tSide("adminPanel"), href: "/" },
          { label: tSide("eventsContent") },
        ]}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <EventsContentTabs />
      {children}
    </div>
  );
}
