import React from "react";
import { NavLink } from "react-router-dom";
import { Button } from "../ui/button";

// navbar_contents example:
//
// const navbar_contents = {
//   homePath: {
//     logo: <WeightliftingIcon className="text-primary h-12 w-12" />,
//     title: <h1 className="text text-5xl font-semibold">Optimal</h1>,
//     path: "/",
//   },
//   navPaths: [
//     { pathTitle: "Path1", path: "/pathname1" },
//     { pathTitle: "Path2", path: "/pathname2" },
//     {
//       pathTitle: "Log In",
//       path: "/login",
//       type: "btn",
//       size: "lg",
//       variant: "default",
//     },
//   ],
// };

const Navbar = ({ navbar_contents }) => {
  return (
    <header className="bg-card border-border fixed z-50 h-auto w-full border-b">
      <nav className="flex items-center justify-between px-6 py-4">
        {/* This handles the logo and title, pathing to a home page of some sort */}
        {"homePath" in navbar_contents && (
          <NavLink to={navbar_contents.homePath.path} className="">
            <div className="flex items-center justify-between gap-3">
              {navbar_contents.homePath.logo}
              {navbar_contents.homePath.title}
            </div>
          </NavLink>
        )}
        {"navPaths" in navbar_contents && (
          <div className="flex items-center justify-between gap-12 px-4">
            {/* This handles the paths on the right side of the navbar, mapping out 
          the navPaths from navbar_contents. Special cases can be added in the first 
          if statement, like i did with btnLg */}
            {navbar_contents.navPaths.map((navPath) => {
              if ("type" in navPath) {
                if (navPath.type === "btn") {
                  return (
                    <Button
                      asChild
                      size={navPath.size}
                      key={navPath.pathTitle}
                      variant={navPath.variant}
                    >
                      <NavLink to={navPath.path}>{navPath.pathTitle}</NavLink>
                    </Button>
                  );
                } else {
                  return <></>;
                }
              }
              return (
                <NavLink
                  className="hover:text-primary text-base transition
                    duration-300"
                  to={navPath.path}
                  key={navPath.pathTitle}
                >
                  {navPath.pathTitle}
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
