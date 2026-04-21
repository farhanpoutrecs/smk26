import { Outlet, useLocation } from "react-router-dom";
import TopHeader from "./TopHeader";
import BottomNav from "./BottomNav";
import WhatsAppFloat from "./WhatsAppFloat";

export const PageLayout = () => {
  const loc = useLocation();
  const isAdmin = loc.pathname.startsWith("/admin");
  const hideFab = isAdmin || loc.pathname.startsWith("/shop");

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <TopHeader />
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      {!hideFab && <WhatsAppFloat />}
      <BottomNav />
    </div>
  );
};

export default PageLayout;
