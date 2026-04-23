import React from "react";
import { Navigate, Outlet, useOutletContext } from "react-router-dom";

const RoleProtectedRoute = ({ requiredRoles }) => {
  const { socket, user, notifications, handleMarkMessagesAsRead, authToken } =
    useOutletContext();
  const userRoles = [
    user?.is_client && "client",
    user?.is_coach && "coach",
    user?.is_admin && "admin",
  ].filter(Boolean);

  if (!authToken || !user) {
    console.log("redirected");
    return <Navigate to="/login" replace />;
  }

  if (!requiredRoles.some((role) => userRoles.includes(role))) {
    if (userRoles.includes("coach")) {
      return <Navigate to="/coachDashboard" replace />;
    } else if (userRoles.includes("client")) {
      return <Navigate to="/clientDashboard" replace />;
    }
    if (userRoles.includes("admin")) {
      return <Navigate to="/adminDashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return (
    <Outlet
      context={{
        socket,
        user,
        notifications,
        handleMarkMessagesAsRead,
        authToken,
      }}
    />
  );
};

export default RoleProtectedRoute;
