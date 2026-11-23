import Navbar from "@/src/components/Navbar";
import SideMenu from "@/src/components/SideMenu";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";
import { buildPortalHomeUrl, getPortalBaseUrl } from "@/src/lib/portal";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * The admin shell (side menu and navbar), only for users whose sign-in lists
 * Community Admin; the navbar shows that user. Signed-out users are sent to
 * the Portal's sign-in here. Others get the page alone, which shows why.
 * Every page still runs `requireProductAccess` itself. The navbar and the side
 * menu get the API address the browser calls (the dev proxy under `next dev`):
 * the navbar for Contact support, the side menu for its badges' counts.
 */
export default async function AppLayout({ children, params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  const portalBaseUrl = getPortalBaseUrl();
  const portalHomeUrl = portalBaseUrl
    ? buildPortalHomeUrl(portalBaseUrl, locale)
    : null;

  if (access.status !== "available") {
    return (
      <main className="flex min-h-screen flex-col p-8">{children}</main>
    );
  }

  const { apiBaseUrl: browserApiUrl } = await readBrowserApiConfig();

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      <SideMenu apiBaseUrl={browserApiUrl} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar
          userName={access.account.name}
          userRole={access.account.roleName}
          portalHomeUrl={portalHomeUrl}
          portalBaseUrl={portalBaseUrl}
          apiBaseUrl={browserApiUrl}
        />
        <main className="flex flex-1 flex-col p-4">{children}</main>
      </div>
    </div>
  );
}
