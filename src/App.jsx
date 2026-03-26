import React from "react";
import { useLocation, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import { WeightliftingIcon } from "./components/icons/guidance-weightlifting.jsx";

const navbar_contents = {
  homePath: {
    logo: <WeightliftingIcon className="text-primary h-12 w-12" />,
    title: <h1 className="text text-5xl font-semibold">Optimal</h1>,
    path: "/",
  },
  navPaths: [
    { pathTitle: "Path1", path: "/pathname1" },
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

const App = () => {
  const location = useLocation();
  const showNavbar = location.pathname === "/";
  return (
    <>
      {showNavbar && <Navbar navbar_contents={navbar_contents} />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<div>Login</div>} />
        <Route path="/signup" element={<div>Signup</div>} />
        <Route path="/pathname1" element={<div>Nav1</div>} />
        <Route path="/pathname2" element={<div>Nav2</div>} />
      </Routes>
    </>
  );
};

export default App;
