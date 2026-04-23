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
  LogOut,
  ArrowLeftRight,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase.js";

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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out failed:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/login", { replace: true });
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
        { to: "/coachProfile", icon: User, label: "Edit Profile" },
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
        border-r py-10"
    >
      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto px-6">
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

      <div
        className="border-border mt-auto flex shrink-0 flex-col gap-2 border-t
          px-6 pb-4 pt-3"
      >
        <Notifications notifications={notifications} />

        {user?.is_coach && user?.is_client && (
          <button
            type="button"
            onClick={toggleActiveMode}
            className="text-foreground hover:bg-sidebar/80 flex w-full items-center
              gap-4 rounded-lg px-4 py-3 text-left text-sm transition-colors"
          >
            <ArrowLeftRight size={20} />
            <span>
              {activeMode === ACTIVE_MODE_MODES.CLIENT
                ? "Coach Dashboard"
                : "Client Dashboard"}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={handleSignOut}
          className="text-muted-foreground hover:bg-sidebar/80 hover:text-destructive
            flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left text-sm
            transition-colors"
        >
          <LogOut size={20} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
