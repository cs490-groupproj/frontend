import { NavLink, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useMemo } from "react";
import Notifications from "@/features/notifications/Notifications";
import { ACTIVE_MODE_MODES } from "../../../config";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  CreditCard,
  User,
  Utensils,
  MessageSquare,
  ChevronDown,
  View,
} from "lucide-react";

const Sidebar = ({ notifications, activeMode, user, setActiveMode }) => {
  const navigate = useNavigate();

  const [openCoaches, setOpenCoaches] = useState(false);
  const location = useLocation();

  const isCoachesRoute = location.pathname.startsWith("/coaches");
  useEffect(() => {
    setOpenCoaches(isCoachesRoute);
  }, [isCoachesRoute]);

  const toggleActiveMode = () => {
    if (activeMode === ACTIVE_MODE_MODES.CLIENT && user?.is_coach) {
      navigate("/coachDashboard", { replace: true });
      setActiveMode(ACTIVE_MODE_MODES.COACH);
    } else if (activeMode === ACTIVE_MODE_MODES.COACH && user?.is_client) {
      navigate("/clientDashboard", { replace: true });
      setActiveMode(ACTIVE_MODE_MODES.CLIENT);
    } else {
      console.log("What? no", activeMode);
    }
  };

  const links = useMemo(() => {
    if (!activeMode) {
      return [];
    }
    if (activeMode === ACTIVE_MODE_MODES.CLIENT) {
      return [
        { to: "/clientDashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/nutrition", icon: Utensils, label: "Nutrition" },
        { type: "coaches" },
        { to: "/exercises", icon: Dumbbell, label: "Exercises" },
        { to: "/payment", icon: CreditCard, label: "Payment" },
        { to: "/profile", icon: User, label: "Edit Profile" },
        { to: "/chat", icon: MessageSquare, label: "Chat" },
      ];
    } else if (activeMode === ACTIVE_MODE_MODES.COACH) {
      return [
        //add more links to coach here, and in app.jsx
        { to: "/coachDashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/clientManagement", icon: Users, label: "My Clients" },
        { to: "/assignWorkouts", icon: Dumbbell, label: "Assign Workouts" },
        {
          to: "/viewClientProgress",
          icon: View,
          label: "View Client Progress",
        },
        { to: "/chat", icon: MessageSquare, label: "Chat" },
      ];
    } else if (activeMode === ACTIVE_MODE_MODES.ADMIN) {
      return [
        { to: "/adminDashboard", icon: LayoutDashboard, label: "Dashboard" },
      ];
    } else {
      console.log(`How tf did ${activeMode} become your active mode???`);
      return [];
    }
  }, [activeMode]);

  return (
    <aside
      className="bg-card border-border fixed flex h-screen w-56 flex-col
        justify-between gap-32 border-r py-10"
    >
      <nav className="space-y-2 px-6">
        {links.map((link) => {
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
      <div>
        <Notifications notifications={notifications} />
        {user?.is_coach && user?.is_client && (
          <div
            className="hover:bg-sidebar/80 mx-6 flex items-center gap-4
              rounded-lg px-6 py-3 transition-colors hover:cursor-pointer"
            onClick={toggleActiveMode}
          >
            {activeMode === ACTIVE_MODE_MODES.CLIENT ? "Coach" : "Client"}{" "}
            Dashboard
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
