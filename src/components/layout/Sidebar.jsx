import { NavLink } from "react-router-dom";
import React from "react";
import Notifications from "@/features/notifications/Notifications";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  CreditCard,
  User,
  Utensils,
  MessageSquare,
} from "lucide-react";

const Sidebar = ({ notifications }) => {
  const links = [
    { to: "/clientDashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/nutrition", icon: Utensils, label: "Nutrition" },
    { to: "/coaches", icon: Users, label: "Browse Coaches" },
    { to: "/exercises", icon: Dumbbell, label: "Exercises" },
    { to: "/payment", icon: CreditCard, label: "Payment" },
    { to: "/profile", icon: User, label: "Edit Profile" },
    { to: "/chat", icon: MessageSquare, label: "Chat" },
  ];

  return (
    <aside
      className="bg-card border-border fixed flex h-screen w-56 flex-col
        justify-between gap-32 border-r py-10"
    >
      <nav className="space-y-2 px-6">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-4 rounded-lg px-4 py-3 transition-colors ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar/80"
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <Notifications notifications={notifications} />
    </aside>
  );
};

export default Sidebar;
