import React from "react";
import { Routes, Route } from "react-router-dom";
import BrowseCoaches from "./components/BrowseCoaches.jsx";
import ClientDashboard from "./components/ClientDashboard.jsx";
import ClientSurvey from "./components/ClientSurvey.jsx";
import LandingPage from "./pages/LandingPage/LandingPage.jsx";

import SignIn from "./components/SignIn.jsx";
import SignUp from "./components/SignUp.jsx";

import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import PublicLayout from "./components/layout/PublicLayout.jsx";

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
        <Route path="/clientdashboard" element={<ClientDashboard />} />
        <Route path="/coaches" element={<BrowseCoaches />} />
        <Route path="/exercises" element={<div>Exercises</div>} />
        <Route path="/payment" element={<div>Payment</div>} />
        <Route path="/profile" element={<div>profile</div>} />
        <Route path="/chat" element={<div>Chat Content</div>} />
      </Route>
      {/* Put things that need neither here */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/clientsurvey" element={<ClientSurvey />} />
    </Routes>
  );
};

export default App;
