import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="bg-surface border-secondary fixed h-auto w-full border-b">
      <nav className="flex items-center justify-between p-4">
        <h1 className="">Icon/Title</h1>
        <div className="">
          <NavLink to="/" className="">
            Home component
          </NavLink>
          <NavLink className="" to="/pathname1">
            Navigation component
          </NavLink>
          <NavLink className="" to="/pathname2">
            Navigation component
          </NavLink>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
