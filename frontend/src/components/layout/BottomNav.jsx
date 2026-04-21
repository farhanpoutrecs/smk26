import { Link, useLocation } from "react-router-dom";
import { HouseSimple, Trophy, ChartBar, Storefront, DotsThreeCircle } from "@phosphor-icons/react";

const ITEMS = [
  { to: "/", label: "Utama", icon: HouseSimple, testid: "bottom-nav-home" },
  { to: "/sports", label: "Sukan", icon: Trophy, testid: "bottom-nav-sports" },
  { to: "/scoreboard", label: "Skor", icon: ChartBar, testid: "bottom-nav-scoreboard" },
  { to: "/shop", label: "Shop", icon: Storefront, testid: "bottom-nav-shop" },
  { to: "/more", label: "Lain", icon: DotsThreeCircle, testid: "bottom-nav-more" },
];

export const BottomNav = () => {
  const loc = useLocation();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0A0A0A]/90 border-t border-[#2D3342] pb-[env(safe-area-inset-bottom)]"
      data-testid="bottom-nav"
    >
      <div className="grid grid-cols-5 max-w-lg mx-auto">
        {ITEMS.map(({ to, label, icon: Icon, testid }) => {
          const active = to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              data-testid={testid}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                active ? "text-[#00D4AA]" : "text-[#94A3B8] hover:text-white"
              }`}
            >
              <div className={`${active ? "bg-[#00D4AA]/10" : ""} rounded-md px-3 py-1.5`}>
                <Icon size={22} weight={active ? "fill" : "regular"} />
              </div>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
