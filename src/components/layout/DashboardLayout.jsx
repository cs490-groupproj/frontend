import React from "react";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../../../config.js";

//eventyally this wil be a get the cookie/wherever we are storing the firebase token
const testToken =
  "eyJhbGciOiJSUzI1NiIsImtpZCI6IjVlODJhZmI0ZWY2OWI3NjM4MzA2OWFjNmI1N2U3ZTY1MjAzYmZlOTYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY3M0OTAtZXhlcmNpc2UtYXBwIiwiYXVkIjoiY3M0OTAtZXhlcmNpc2UtYXBwIiwiYXV0aF90aW1lIjoxNzc1NTIyMjk0LCJ1c2VyX2lkIjoiWlhrS1REaFlkdlpHejZ0cnZ6NkdGSGJrSXA5MyIsInN1YiI6IlpYa0tURGhZZHZaR3o2dHJ2ejZHRkhia0lwOTMiLCJpYXQiOjE3NzU1MjIyOTQsImV4cCI6MTc3NTUyNTg5NCwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInRlc3RAZXhhbXBsZS5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.PjqaQ8_oTzNR2QYDd6BDWz_rZP3Kgd2CVOPzsORcKFyTlIxLu9amG4Ds4Qi9_TX5rGmXqwI5Xi1eZDJEP8ft8Yy8Mabz8sDSJA6QKXWAGb-lhyA0Yy4A3K3-yFn2B8zLz2nvvO8Ldc-vMzZ5iU1Fp7UvTC-FsebBnZ1zQU58kF8nBctxeJXe_wsCKVCWPVkWen5RGNyqJuJRV43N_aF3Kvpof1bDXVlA0niFyDzki6l_kibEQ5MUNzCnLgq4KwmpjtN--QcCWi56v-IUz-V3g6D2oeuCtgtQVU7FsDs9i-Ec3FRmeETyfQdC0tpA6_jy8mTdpy413r8Wj5wN0JBLvQ";
const DashboardLayout = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(API_BASE_URL, { query: { token: testToken } });
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Sidebar />

      <main className="flex min-h-screen overflow-y-auto p-8 pl-72">
        <Outlet context={{ socket }} />
      </main>
    </div>
  );
};

export default DashboardLayout;
