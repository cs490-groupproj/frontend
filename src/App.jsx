import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import SignIn from "./components/SignIn.jsx";
import SignUp from "./components/SignUp.jsx";
import ClientSurvey from "./components/ClientSurvey.jsx";
function AppRoutes() {
  const location = useLocation();
  const authPaths = ["/"];
  const showNavbar = !authPaths.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/clientsurvey" element={<ClientSurvey />} />
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