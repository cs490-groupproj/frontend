import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Sidebar />
      <main className="flex overflow-y-auto p-8 pl-72">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
