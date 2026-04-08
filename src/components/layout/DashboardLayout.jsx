import React from "react";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../../../config.js";

//eventually this wil be a get the cookie/wherever we are storing the firebase token
const testToken = "...";
const DashboardLayout = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(API_BASE_URL, {
      query: { token: testToken },
    });

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Sidebar />

      <main className="flex min-h-screen overflow-y-auto p-8 pl-72">
        <Outlet context={{ socket, testToken }} />
      </main>
    </div>
  );
};

export default DashboardLayout;
