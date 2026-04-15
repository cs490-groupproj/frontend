import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useSocketNotifications } from "@/hooks/useSocketNotifications";

const DashboardLayout = () => {
  const {
    authToken,
    socket,
    user,
    unreadChatNotifications,
    handleMarkMessagesAsRead,
  } = useSocketNotifications();

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Sidebar />
      {authToken && user ? (
        <main className="flex min-h-screen overflow-y-auto p-8 pl-72">
          <Outlet
            context={{
              socket,
              user,
              unreadChatNotifications,
              handleMarkMessagesAsRead,
            }}
          />
        </main>
      ) : (
        <p>content loading</p>
      )}
    </div>
  );
};

export default DashboardLayout;
