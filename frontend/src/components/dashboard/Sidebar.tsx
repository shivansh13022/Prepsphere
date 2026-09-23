import {
  BriefcaseBusiness,
  FileText,
  GraduationCap,
  House,
  MessageSquareText,
  Settings,
  ClipboardList,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navigation = [
  { name: "Home", path: "/dashboard", icon: House },
  { name: "Jobs", path: "/jobs", icon: BriefcaseBusiness },
  { name: "Resume", path: "/resume", icon: FileText },
  { name: "Interviews", path: "/interviews", icon: MessageSquareText },
  { name: "Learning", path: "/learning", icon: GraduationCap },
  { name: "Applications", path: "/applications", icon: ClipboardList },
];

function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-white/10 bg-[#080b11] px-4 py-6">
      <div className="px-3">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Prep<span className="text-blue-400">Sphere</span>
        </h1>

        <p className="mt-1 text-xs text-white/35">
          AI Career Intelligence
        </p>
      </div>

      <nav className="mt-10 flex flex-1 flex-col gap-1">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
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

      <NavLink
        to="/settings"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
      >
        <Settings size={18} />
        <span>Settings</span>
      </NavLink>
    </aside>
  );
}

export default Sidebar;