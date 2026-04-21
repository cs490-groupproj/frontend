import React from "react";
import { Routes, Route } from "react-router-dom";
import BrowseCoaches from "./pages/Coaches/BrowseCoaches.jsx";
import ClientDashboard from "./pages/ClientDashboard/ClientDashboard.jsx";
import ClientSurvey from "./pages/SignUp_Login/ClientSurvey.jsx";
import Chat from "./pages/Chat/Chat.jsx";
import CoachSurvey from "./pages/SignUp_Login/CoachSurvey.jsx";
import LandingPage from "./pages/LandingPage/LandingPage.jsx";
import EditProfile from "./pages/Profile/EditClientProfile.jsx";
import MyCoach from "./pages/coaches/MyCoach.jsx";

import LogIn from "./pages/SignUp_Login/LogIn.jsx";
import SignUp from "./pages/SignUp_Login/SignUp.jsx";

import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import PublicLayout from "./components/layout/PublicLayout.jsx";

import PaymentPage from "./pages/Payment/PaymentPage.jsx";
import Nutrition from "./pages/Nutrition/nutrition.jsx";
import Workouts from "./pages/Workouts/Workouts.jsx";

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
        <Route path="/coaches/browse" element={<BrowseCoaches />} />
        <Route path="/coaches/my-coach" element={<MyCoach />} />
        <Route path="/exercises" element={<Workouts />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/profile" element={<EditProfile />} />
        <Route path="/chat" element={<Chat />} />

        <Route path="/coachDashboard" element={<div>Coach Dashboard</div>} />
        <Route path="/clientManagement" element={<div>My Clients</div>} />
        <Route path="/assignWorkouts" element={<div>Assign Workouts</div>} />
        <Route
          path="/viewClientProgress"
          element={<div>View Client Progress</div>}
        />
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
