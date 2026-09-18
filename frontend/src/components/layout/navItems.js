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
  { name: "Home", path: "/", icon: Home },
  { name: "Portfolio", path: "/portfolio", icon: PieChart },
  { name: "Watchlist", path: "/watchlist", icon: Bookmark },
  { name: "Activity", path: "/activity", icon: Activity },
  { name: "Wallet", path: "/wallet", icon: Wallet },
  { name: "Payment Details", path: "/payment-details", icon: Landmark },
  { name: "Withdrawal", path: "/withdrawal", icon: Banknote },
  { name: "Profile", path: "/profile", icon: User },
];

export const adminItem = {
  name: "Admin",
  path: "/admin/withdrawal",
  icon: ShieldCheck,
};

export const mobileTabs = ["/", "/portfolio", "/wallet", "/watchlist"];
