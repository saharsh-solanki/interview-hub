import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  CalendarDays,
  Users,
  BookOpen,
  LayoutDashboard,
  UserCog,
  UserPlus,
  CalendarPlus,
  LogOut,
  Menu,
  X,
  CalendarRange,
  Building2,
  ListOrdered,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const interviewerLinks = [
  { to: "/", icon: CalendarDays, label: "My Schedule" },
  { to: "/all", icon: Users, label: "All Schedules" },
  { to: "/questions", icon: BookOpen, label: "Questions Bank" },
];

const adminLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/profiles", icon: UserCog, label: "Manage Profiles" },
  { to: "/admin/interviewers", icon: UserPlus, label: "Manage Interviewers" },
  { to: "/admin/companies", icon: Building2, label: "Manage Companies" },
  { to: "/admin/rounds", icon: ListOrdered, label: "Manage Rounds" },
  { to: "/admin/schedule", icon: CalendarPlus, label: "Schedule Interview" },
];

export default function Sidebar() {
  const { user, isStaff, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer min-h-[44px] ${
      isActive
        ? "bg-primary text-white"
        : "text-ink-muted hover:bg-surface-muted hover:text-ink"
    }`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 p-2 rounded-lg bg-surface-card border border-border cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-surface-card border-r border-border flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <CalendarRange size={24} className="text-primary" />
            <span className="text-lg font-semibold text-ink">
              Interview Hub
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-1 rounded cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {isStaff && (
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-ink-light">
              Interviews
            </p>
          )}
          {interviewerLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}

          {isStaff && (
            <>
              <p className="px-3 mt-5 mb-2 text-xs font-semibold uppercase tracking-wider text-ink-light">
                Admin
              </p>
              {adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/admin"}
                  className={linkClass}
                  onClick={() => setOpen(false)}
                >
                  <link.icon size={18} />
                  {link.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">
                {user?.name}
              </p>
              <p className="text-xs text-ink-muted capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-ink-muted hover:bg-danger-light hover:text-danger transition-colors duration-150 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
