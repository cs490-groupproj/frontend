import React from "react";
import { Routes, Route } from "react-router-dom";
import BrowseCoaches from "./pages/ClientDashboard/components/BrowseCoaches.jsx";
import ClientDashboard from "./pages/ClientDashboard/ClientDashboard.jsx";
import ClientSurvey from "./pages/SignUp_Login/ClientSurvey.jsx";
import CoachSurvey from "./pages/SignUp_Login/CoachSurvey.jsx";
import LandingPage from "./pages/LandingPage/LandingPage.jsx";

import LogIn from "./pages/SignUp_Login/LogIn.jsx";
import SignUp from "./pages/SignUp_Login/SignUp.jsx";

import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import PublicLayout from "./components/layout/PublicLayout.jsx";

import PaymentPage from "./pages/Payment/PaymentPage.jsx";
import Nutrition from "./pages/Nutrition/nutrition.jsx";
import EditClientProfile from "./pages/Profile/EditClientProfile.jsx";

// ONLY PUT ROUTES IN HERE. DON'T STYLE. IF YOU WANT TO STYLE, GO TO THE LAYOUT
const App = () => {
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
        <Route path="/exercises" element={<div>Exercises</div>} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/profile" element={<EditClientProfile />} />
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
