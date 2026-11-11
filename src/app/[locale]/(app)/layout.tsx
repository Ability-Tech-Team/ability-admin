import Navbar from "@/src/components/Navbar";
import SideMenu from "@/src/components/SideMenu";
import { requireProductAccess } from "@/src/lib/access";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * The admin shell (side menu and navbar), only for users whose sign-in lists
 * Community Admin; the navbar shows that user. Signed-out users are sent to
 * the Portal's sign-in here. Others get the page alone, which shows why.
 * Every page still runs `requireProductAccess` itself.
 */
export default async function AppLayout({ children, params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return (
      <main className="flex min-h-screen flex-col p-8">{children}</main>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      <SideMenu />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar
          userName={access.account.name}
          userRole={access.account.roleName}
        />
        <main className="flex flex-1 flex-col p-4">{children}</main>
      </div>
    </div>
  );
}
