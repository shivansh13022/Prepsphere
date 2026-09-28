import { useState } from "react";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/dashboard/Sidebar";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      <div className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar />
      </div>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#080b11]/95 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/70 transition hover:bg-white/5 hover:text-white"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <div className="text-lg font-semibold tracking-tight">
          Prep
          <span className="text-blue-400">Sphere</span>
        </div>

        {/* Keeps logo centered */}
        <div className="h-9 w-9" />
      </header>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Background overlay */}

          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer */}

          <div className="relative h-full w-[82%] max-w-[290px] shadow-2xl">
            <Sidebar
              mobile
              onNavigate={() => setSidebarOpen(false)}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ================================ */}
      {/* PAGE CONTENT */}
      {/* ================================ */}

      <main className="min-h-screen lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
