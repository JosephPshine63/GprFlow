import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import BrandMark from "@/components/custome/BrandMark";
import { cn } from "@/lib/utils";
import { adminItem, navItems } from "./navItems";

const linkClass = ({ isActive }) =>
  cn(
    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
    "justify-center lg:justify-start",
    isActive
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
  );

const Sidebar = () => {
  const role = useSelector((store) => store.auth.user?.role);
  const items = role === "ROLE_ADMIN" ? [...navItems, adminItem] : navItems;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-16 flex-col border-r bg-card md:flex lg:w-60">
      <NavLink
        to="/"
        className="flex h-16 items-center justify-center gap-3 border-b px-4 lg:justify-start"
        aria-label="GprFlow"
      >
        <BrandMark className="h-7" />
        <span className="hidden font-heading text-lg font-bold lg:block">
          GprFlow
        </span>
      </NavLink>

      <nav className="thin-scroll flex-1 space-y-1 overflow-y-auto p-3">
        {items.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={linkClass}
            aria-label={name}
            title={name}
          >
            <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            <span className="hidden lg:block">{name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
