import React from "react";
import { NavLink } from "react-router-dom";

const LandingPageFooter = () => {
  const currentYear = new Date().getFullYear();
  return (
    <section
      className="bg-card-muted grid grid-cols-3 justify-between gap-8 p-16"
    >
      <div
        className="text-card-muted-foreground flex flex-col items-center
          justify-center"
      >
        <h1>Copyright © Optimal {currentYear} All rights reserved</h1>
      </div>
      <div
        className="text-card-foreground flex flex-col items-center
          justify-center"
      >
        <NavLink
          className="hover:text-primary text-lg transition duration-300"
          to="/"
        >
          Home
        </NavLink>
        <NavLink
          className="hover:text-primary text-lg transition duration-300"
          to="/signin"
        >
          Sign In
        </NavLink>
        <NavLink
          className="hover:text-primary text-lg transition duration-300"
          to="/signup"
        >
          Sign Up
        </NavLink>
      </div>
      <div className="text-foreground flex flex-col items-center justify-center">
        <div>
          <h1 className="">Built By:</h1>
          <ul className="list-inside list-disc">
            <li>Meera James</li>
            <li>Joseph Juchniewicz</li>
            <li>Dominic Lambusta</li>
            <li>Burhan Naveed</li>
            <li>Manisha Palaniappan</li>
            <li>Orhan Utoglu</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default LandingPageFooter;
