import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, MoreHorizontal } from "lucide-react";
import { logout } from "@/Redux/Auth/Action";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { adminItem, mobileTabs, navItems } from "./navItems";

const tabClass = ({ isActive }) =>
  cn(
    "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium",
    isActive ? "text-primary" : "text-muted-foreground"
  );

const MobileTabBar = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const role = useSelector((store) => store.auth.user?.role);

  const tabs = navItems.filter((i) => mobileTabs.includes(i.path));
  const more = navItems.filter((i) => !mobileTabs.includes(i.path));
  if (role === "ROLE_ADMIN") more.push(adminItem);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setOpen(false);
    dispatch(logout());
    navigate("/");
  };

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label={t("nav.main")}
      >
        {tabs.map(({ labelKey, path, icon: Icon }) => (
          <NavLink key={path} to={path} end={path === "/"} className={tabClass}>
            <Icon className="h-5 w-5" strokeWidth={1.75} />
            {t(labelKey)}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground"
        >
          <MoreHorizontal className="h-5 w-5" strokeWidth={1.75} />
          {t("nav.more")}
        </button>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="text-left">{t("nav.menu")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid gap-1">
            {more.map(({ labelKey, path, icon: Icon }) => (
              <button
                key={path}
                type="button"
                onClick={() => go(path)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium hover:bg-primary/5"
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
                {t(labelKey)}
              </button>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-down hover:bg-down/10"
            >
              <LogOut className="h-5 w-5" strokeWidth={1.75} />
              {t("nav.logout")}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileTabBar;
