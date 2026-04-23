import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useSocketNotifications } from "@/hooks/useSocketNotifications";
import { ACTIVE_MODE_MODES } from "../../../config";

const DashboardLayout = () => {
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
    }
  }, [activeMode]);
  useEffect(() => {
    if (!user) {
      return;
    }
    if (activeMode) return;

    if (user?.is_coach) {
      setActiveMode(ACTIVE_MODE_MODES.COACH);
    } else if (user?.is_client) {
      setActiveMode(ACTIVE_MODE_MODES.CLIENT);
    } else if (user?.is_admin) {
      setActiveMode(ACTIVE_MODE_MODES.ADMIN);
    } else {
      console.log("'Ey Jimmy. Gimme a user with nuthin'");
    }
  }, [user]);

  return (
    <div className="bg-background text-foreground min-h-screen">
      {
        <Sidebar
          notifications={notifications}
          activeMode={activeMode}
          user={user}
          socket={socket}
          setActiveMode={setActiveMode}
        />
      }
      {!isAppLoading ? (
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
      ) : (
        <p className="flex min-h-screen items-center justify-center p-8 pl-72">
          content loading
        </p>
      )}
    </div>
  );
};

export default DashboardLayout;
