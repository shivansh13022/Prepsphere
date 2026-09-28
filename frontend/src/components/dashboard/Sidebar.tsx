import {
  BriefcaseBusiness,
  ClipboardList,
  FileText,
  House,
  LogIn,
  LogOut,
  MessageSquareText,
  TrendingUp,
  X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

const navigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: House,
  },
  {
    name: "Jobs",
    path: "/jobs",
    icon: BriefcaseBusiness,
  },
  {
    name: "Resume",
    path: "/resume",
    icon: FileText,
  },
  {
    name: "Interviews",
    path: "/interviews",
    icon: MessageSquareText,
  },
  {
    name: "Applications",
    path: "/applications",
    icon: ClipboardList,
  },
  {
    name: "Progress",
    path: "/progress",
    icon: TrendingUp,
  },
];

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
}

function Sidebar({ mobile = false, onNavigate, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const isLoggedIn = Boolean(localStorage.getItem("access_token"));

  const handleAuthAction = () => {
    // -----------------------------
    // LOGOUT
    // -----------------------------

    if (isLoggedIn) {
      localStorage.removeItem("access_token");

      // Close mobile sidebar if needed.
      onNavigate?.();

      // Redirect to public homepage.
      navigate("/", {
        replace: true,
      });

      return;
    }

    // -----------------------------
    // LOGIN
    // -----------------------------

    onNavigate?.();

    navigate("/login");
  };

  return (
    <aside className="flex h-full w-full flex-col border-r border-white/10 bg-[#080b11] px-4 py-6">
      {/* ================================ */}
      {/* BRAND */}
      {/* ================================ */}

      <div className="flex items-start justify-between px-3">
        <div className="flex items-center gap-3">
          <img
            src="/branding/prepsphere-mark.png"
            alt="PrepSphere"
            className="h-10 w-10 shrink-0 object-contain"
          />

          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              Prep
              <span className="text-blue-400">Sphere</span>
            </h1>

            <p className="mt-0.5 text-[11px] tracking-wide text-white/35">
              AI Career Intelligence
            </p>
          </div>
        </div>

        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white"
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        )}
      </div>

      {/* ================================ */}
      {/* NAVIGATION */}
      {/* ================================ */}

      <nav className="mt-10 flex flex-1 flex-col gap-1">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={18} />

              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* ================================ */}
      {/* LOGIN / LOGOUT */}
      {/* ================================ */}

      <button
        type="button"
        onClick={handleAuthAction}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
          isLoggedIn
            ? "text-white/55 hover:bg-red-500/[0.06] hover:text-red-300"
            : "text-white/55 hover:bg-white/5 hover:text-white"
        }`}
      >
        {isLoggedIn ? (
          <>
            <LogOut size={18} />
            <span>Logout</span>
          </>
        ) : (
          <>
            <LogIn size={18} />
            <span>Login</span>
          </>
        )}
      </button>
    </aside>
  );
}

export default Sidebar;
