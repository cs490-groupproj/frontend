import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useSocketNotifications } from "@/hooks/useSocketNotifications";

const DashboardLayout = () => {
  const { authToken, socket, user, notifications, handleMarkMessagesAsRead } =
    useSocketNotifications();

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Sidebar notifications={notifications} />
      {authToken && user ? (
        <main className="flex min-h-screen overflow-y-auto p-8 pl-64">
          <Outlet
            context={{
              socket,
              user,
              notifications,
              handleMarkMessagesAsRead,
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
