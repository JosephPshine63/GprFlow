import {
  Activity,
  Banknote,
  Bookmark,
  Home,
  Landmark,
  PieChart,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";

export const navItems = [
  { labelKey: "nav.home", path: "/", icon: Home },
  { labelKey: "nav.portfolio", path: "/portfolio", icon: PieChart },
  { labelKey: "nav.watchlist", path: "/watchlist", icon: Bookmark },
  { labelKey: "nav.activity", path: "/activity", icon: Activity },
  { labelKey: "nav.wallet", path: "/wallet", icon: Wallet },
  { labelKey: "nav.paymentDetails", path: "/payment-details", icon: Landmark },
  { labelKey: "nav.withdrawal", path: "/withdrawal", icon: Banknote },
  { labelKey: "nav.profile", path: "/profile", icon: User },
];

export const adminItem = {
  labelKey: "nav.admin",
  path: "/admin/withdrawal",
  icon: ShieldCheck,
};

export const mobileTabs = ["/", "/portfolio", "/wallet", "/watchlist"];
