import { SideMenu } from "@/src/modules/side-menu";
import { Navbar } from "@/src/modules/navbar";

type Props = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      <SideMenu />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar
          userName="Basem Elfaky"
          userRole="Super Admin"
          userInitials="BE"
          notificationCount={3}
        />
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
