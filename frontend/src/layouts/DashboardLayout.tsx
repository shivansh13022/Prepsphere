import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";

function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-[#070A0F] text-white">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;