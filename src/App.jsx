import React from "react";
import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage/LandingPage.jsx";

import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import PublicLayout from "./components/layout/PublicLayout.jsx";
import RoleProtectedRoute from "./components/layout/RoleProtectedRoute.jsx";

import LogIn from "./pages/SignUp_Login/LogIn.jsx";
import SignUp from "./pages/SignUp_Login/SignUp.jsx";
import ClientSurvey from "./pages/SignUp_Login/ClientSurvey.jsx";
import CoachSurvey from "./pages/SignUp_Login/CoachSurvey.jsx";

import BrowseCoaches from "./pages/Coaches/BrowseCoaches.jsx";
import ClientDashboard from "./pages/ClientDashboard/ClientDashboard.jsx";
import MyCoach from "./pages/coaches/MyCoach.jsx";
import ClientManagement from "./pages/coaches/ClientManagement.jsx";
import Workouts from "./pages/Workouts/Workouts.jsx";
import Nutrition from "./pages/Nutrition/nutrition.jsx";
import PaymentPage from "./pages/Payment/PaymentPage.jsx";
import EditProfile from "./pages/Profile/EditClientProfile.jsx";
import Chat from "./pages/Chat/Chat.jsx";
import ClientManagement from "./pages/Coach/ClientManagement.jsx";
import CoachClientView from "./pages/Coach/CoachClientView.jsx";

import EditCoachProfile from "./pages/Profile/EditCoachProfile.jsx";

import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
const App = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route element={<RoleProtectedRoute requiredRoles={["client"]} />}>
          <Route path="/clientDashboard" element={<ClientDashboard />} />
          <Route path="/coaches/browse" element={<BrowseCoaches />} />
          <Route path="/coaches/my-coach" element={<MyCoach />} />
          <Route path="/coaches/client-management" element={<ClientManagement />} />
          <Route path="/exercises" element={<Workouts />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/profile" element={<EditProfile />} />
        </Route>

        <Route
          element={<RoleProtectedRoute requiredRoles={["coach", "client"]} />}
        >
          <Route path="/chat" element={<Chat />} />
        </Route>

        <Route element={<RoleProtectedRoute requiredRoles={["coach"]} />}>
          <Route path="/coachDashboard" element={<div>Coach Dashboard</div>} />
          <Route path="/clientManagement" element={<ClientManagement />} />
          <Route
            path="/clientManagement/:clientId/view"
            element={<CoachClientView />}
          />
          <Route path="/assignWorkouts" element={<div>Assign Workouts</div>} />
          <Route
            path="/viewClientProgress"
            element={<div>View Client Progress</div>}
          />
          <Route path="/coachProfile" element={<EditCoachProfile />} />
        </Route>

        <Route element={<RoleProtectedRoute requiredRoles={["admin"]} />}>
          <Route path="/adminDashboard" element={<AdminDashboard />} />
        </Route>
      </Route>

      <Route path="/login" element={<LogIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/clientSurvey" element={<ClientSurvey />} />
      <Route path="/coachSurvey" element={<CoachSurvey />} />
    </Routes>
  );
};

export default App;
