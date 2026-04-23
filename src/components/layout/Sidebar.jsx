import { NavLink, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Notifications from "@/features/notifications/Notifications";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  CreditCard,
  User,
  Utensils,
  MessageSquare,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
const Sidebar = ({ notifications }) => {
  const [openCoaches, setOpenCoaches] = useState(false);
  const location = useLocation();

  const isCoachesRoute = location.pathname.startsWith("/coaches");
  useEffect(() => {
    if (isCoachesRoute) {
      setOpenCoaches(true);
    }
  }, [isCoachesRoute]);

  const links = [
    { to: "/clientDashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/nutrition", icon: Utensils, label: "Nutrition" },
    { type: "coaches" },
    { to: "/exercises", icon: Dumbbell, label: "Exercises" },
    { to: "/payment", icon: CreditCard, label: "Payment" },
    { to: "/profile", icon: User, label: "Edit Profile" },
    { to: "/chat", icon: MessageSquare, label: "Chat" },
    { to: "/adminDashboard", icon: ShieldCheck, label: "Admin Panel" },
  ];

  return (
    <aside
      className="bg-card border-border fixed flex h-screen w-56 flex-col
        justify-between gap-32 border-r py-10"
    >
      <nav className="space-y-2 px-6">
        {links.map((link, idx) => {
          // Coaches section
          if (link.type === "coaches") {
            return (
              <div key="coaches">
                {/* Parent tab */}
                <button
                  onClick={() => setOpenCoaches((prev) => !prev)}
                  className={`flex w-full items-center justify-between
                  rounded-lg px-4 py-3 ${
                    isCoachesRoute
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "hover:bg-sidebar/80"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Users size={20} />
                    <span>Coaches</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      openCoaches ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Subtabs */}
                {openCoaches && (
                  <div className="mt-1 ml-8 space-y-1">
                    <NavLink
                      to="/coaches/browse"
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2 text-sm ${
                          isActive
                            ? `bg-sidebar-primary
                              text-sidebar-primary-foreground`
                            : "hover:bg-sidebar/80"
                        }`
                      }
                    >
                      Browse Coaches
                    </NavLink>

                    <NavLink
                      to="/coaches/my-coach"
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2 text-sm ${
                          isActive
                            ? `bg-sidebar-primary
                              text-sidebar-primary-foreground`
                            : "hover:bg-sidebar/80"
                        }`
                      }
                    >
                      My Coach
                    </NavLink>
                  </div>
                )}
              </div>
            );
          }

          // Normal links
          const { to, icon: Icon, label } = link;

          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-lg px-4 py-3 transition-colors
                ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar/80"
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>
      <Notifications notifications={notifications} />
    </aside>
  );
};

export default Sidebar;
