import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase.js";
import BrowseCoaches from "./pages/ClientDashboard/components/BrowseCoaches.jsx";
import ClientDashboard from "./pages/ClientDashboard/ClientDashboard.jsx";
import ClientSurvey from "./pages/SignUp_Login/ClientSurvey.jsx";
import CoachSurvey from "./pages/SignUp_Login/CoachSurvey.jsx";
import LandingPage from "./pages/LandingPage/LandingPage.jsx";
import Exercises from "./pages/ClientDashboard/Exercises.jsx";

import LogIn from "./pages/SignUp_Login/LogIn.jsx";
import SignUp from "./pages/SignUp_Login/SignUp.jsx";

import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import PublicLayout from "./components/layout/PublicLayout.jsx";

import PaymentPage from "./pages/Payment/PaymentPage.jsx";
import Nutrition from "./pages/Nutrition/nutrition.jsx";

// ONLY PUT ROUTES IN HERE. DON'T STYLE. IF YOU WANT TO STYLE, GO TO THE LAYOUT
const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        console.log("User is signed in:", user.uid);
      } else {
        // User is signed out
        console.log("User is signed out");
        // Clear stored data
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        // Redirect to login if on protected route
        const protectedRoutes = ["/clientDashboard", "/exercises", "/nutrition", "/coaches", "/payment", "/profile", "/chat"];
        if (protectedRoutes.some(route => window.location.pathname.startsWith(route))) {
          navigate("/login", { replace: true });
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <Routes>
      {/* Put things that need the navbar in here */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>
      {/* put things that need the sidebar in here */}
      <Route element={<DashboardLayout />}>
        <Route path="/clientDashboard" element={<ClientDashboard />} />
        <Route path="/coaches" element={<BrowseCoaches />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/profile" element={<div>profile</div>} />
        <Route path="/chat" element={<div>Chat Content</div>} />
      </Route>
      {/* Put things that need neither here */}
      <Route path="/login" element={<LogIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/clientSurvey" element={<ClientSurvey />} />
      <Route path="/coachSurvey" element={<CoachSurvey />} />
    </Routes>
  );
};

export default App;
