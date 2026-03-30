import React from "react";
import { Outlet } from "react-router-dom";
import { WeightliftingIcon } from "../icons/guidance-weightlifting";
import Navbar from "./Navbar";

const PublicLayout = () => {
  const navbar_contents = {
    homePath: {
      logo: <WeightliftingIcon className="text-primary h-12 w-12" />,
      title: <h1 className="text text-5xl font-semibold">Optimal</h1>,
      path: "/",
    },
    navPaths: [
      { pathTitle: "Client Dashboard", path: "/clientDashboard" },
      { pathTitle: "Path2", path: "/pathname2" },
      {
        pathTitle: "Log In",
        path: "/login",
        type: "btn",
        size: "lg",
        variant: "default",
      },
    ],
  };
  return (
    <div>
      <Navbar navbar_contents={navbar_contents} />
      <Outlet />
    </div>
  );
};

export default PublicLayout;
