import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import SignIn from "./components/SignIn.jsx";
import ClientSignUp from "./components/ClientSignUp.jsx";
import CoachSignUp from "./components/CoachSignUp.jsx";
import ClientorCoach from "./components/ClientorCoach.jsx";

function AppRoutes() {
  const location = useLocation();
  const authPaths = ["/"];
  const showNavbar = !authPaths.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/clientorcoach" element={<ClientorCoach />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/clientsignup" element={<ClientSignUp />} />
        <Route path="/coachsignup" element={<CoachSignUp />} />
        <Route path="/pathname1" element={<div>Navigation component</div>} />
        <Route path="/pathname2" element={<div>Navigation component</div>} />
      </Routes>
    </>
  );
}

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
