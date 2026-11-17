import { getTranslations } from "next-intl/server";
import GuestSummaryCards from "./components/GuestSummaryCards";
import GuestInvitationsPageClient from "./components/GuestInvitationsPageClient";
import { fetchGuestInvitationStats, fetchGuestInvitations } from "@/src/services/guestInvitations";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function GuestInvitationsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("Operations");
  const [stats, invitations] = await Promise.all([
    fetchGuestInvitationStats(),
    fetchGuestInvitations(),
  ]);

  return (
    <>
      <GuestSummaryCards stats={stats} />
      <GuestInvitationsPageClient
        data={invitations}
        labels={{
          searchPlaceholder: t("searchGuests"),
          exactSearch: t("exactSearch"),
          status: t("status"),
          addLabel: t("guest.createInvitation"),
        }}
      />
    </>
  );
}
