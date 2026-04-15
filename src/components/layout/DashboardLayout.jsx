import React from "react";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../../../config.js";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import useGetFromAPI from "@/hooks/useGetFromAPI";

const DashboardLayout = () => {
  const [socket, setSocket] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [requestURI, setRequestURI] = useState(null);

  //gets the userID, requestURI will be null until the auth token is gotten
  const { data: user } = useGetFromAPI(requestURI, null);

  //Paused until auth loads to prevent 401 errors
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setAuthToken(token);
        //since we have auth, we can change the requestURI to the one to fetch the user id
        setRequestURI("/users/me");
      }
    });
    return () => unsubscribe();
  }, []);

  //when we get the authToken, get sockets
  useEffect(() => {
    if (!authToken) {
      return;
    }
    const newSocket = io(API_BASE_URL, {
      query: { token: authToken },
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [authToken]);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Sidebar />
      {authToken && user ? (
        <main className="flex min-h-screen overflow-y-auto p-8 pl-72">
          <Outlet context={{ socket, user, authToken }} />
        </main>
      ) : (
        <p>content loading</p>
      )}
    </div>
  );
};

export default DashboardLayout;
