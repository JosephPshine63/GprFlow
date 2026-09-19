import { Outlet } from "react-router-dom";
import ChatWidget from "@/components/custome/ChatWidget";
import MobileTabBar from "./MobileTabBar";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AppShell = () => (
  <div className="min-h-screen bg-background">
    <Sidebar />
    <div className="flex min-h-screen flex-col md:pl-16 lg:pl-60">
      <Topbar />
      <main className="flex-1 px-4 pb-24 pt-6 md:px-6 md:pb-24">
        <Outlet />
      </main>
    </div>
    <MobileTabBar />
    <ChatWidget />
  </div>
);

export default AppShell;
