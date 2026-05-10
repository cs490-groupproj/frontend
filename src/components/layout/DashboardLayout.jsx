import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useSocketNotifications } from "@/hooks/useSocketNotifications";
import { ACTIVE_MODE_MODES } from "../../../config";

const DashboardLayout = () => {
  const location = useLocation();

  // activeMode is ui only for displaying the correct sidebar. it IS NOT ALWAYS
  // RIGHT, so you MUST NOT USE IT for checking the user's role, use user.is_*
  // for that
  const [activeMode, setActiveMode] = useState(() => {
    return localStorage.getItem("activeMode");
  });
  const {
    authToken,
    socket,
    user,
    notifications,
    handleMarkMessagesAsRead,
    isAppLoading,
  } = useSocketNotifications();

  useEffect(() => {
    if (activeMode) {
      localStorage.setItem("activeMode", activeMode);
    } else {
      localStorage.removeItem("activeMode");
    }
  }, [activeMode]);

  useEffect(() => {
    if (!user) return;

    const path = location.pathname;

    const isCoachRoute = [
      "/coachDashboard",
      "/clientManagement",
      "/assignWorkouts",
      "/coachProfile",
    ].some((p) => path.startsWith(p));

    const isAdminRoute = ["/admin"].some((p) => path.startsWith(p));

    const isClientRoute = [
      "/ClientDashboard",

      "/clientDashboard",
      "/coaches/browse",
      "/coaches/my-coach",
      "/exercises",
      "/nutrition",
      "/payment",
      "/profile",
    ].some((p) => path.startsWith(p));

    if (isCoachRoute && user?.is_coach) {
      setActiveMode(ACTIVE_MODE_MODES.COACH);
    } else if (isClientRoute && user?.is_client) {
      setActiveMode(ACTIVE_MODE_MODES.CLIENT);
    } else if (isAdminRoute && user?.is_admin) {
      setActiveMode(ACTIVE_MODE_MODES.ADMIN);
    }
  }, [location.pathname, user]);
  useEffect(() => {
    if (!user) {
      return;
    }
    const isModeValid =
      (activeMode === ACTIVE_MODE_MODES.COACH && user?.is_coach) ||
      (activeMode === ACTIVE_MODE_MODES.CLIENT && user?.is_client) ||
      (activeMode === ACTIVE_MODE_MODES.ADMIN && user?.is_admin);
    if (!activeMode || !isModeValid) {
      let defaultMode = ACTIVE_MODE_MODES.CLIENT;
      if (user?.is_admin) {
        defaultMode = ACTIVE_MODE_MODES.ADMIN;
      } else if (user?.is_coach) {
        defaultMode = ACTIVE_MODE_MODES.COACH;
      } else if (user?.is_client) {
        defaultMode = ACTIVE_MODE_MODES.CLIENT;
      } else {
        console.log("'Ey Jimmy. Gimme a user with nuthin'");
      }
      setActiveMode(defaultMode);
    }
  }, [user, activeMode]);

  return (
    <div className="bg-background text-foreground min-h-screen">
      {!isAppLoading ? (
        <div>
          <Sidebar
            notifications={notifications}
            activeMode={activeMode}
            user={user}
            socket={socket}
            setActiveMode={setActiveMode}
          />

          <main className="flex min-h-screen overflow-y-auto p-8 pl-64">
            <Outlet
              context={{
                socket,
                user,
                notifications,
                handleMarkMessagesAsRead,
                authToken,
              }}
            />
          </main>
        </div>
      ) : (
        <p className="flex min-h-screen items-center justify-center">
          content loading
        </p>
      )}
    </div>
  );
};

export default DashboardLayout;
