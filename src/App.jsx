import React from "react";
import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage/LandingPage.jsx";
import VisitorExerciseBankView from "./pages/VisitorExerciseBank/VisitorExerciseBankView.jsx";

import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import PublicLayout from "./components/layout/PublicLayout.jsx";
import RoleProtectedRoute from "./components/layout/RoleProtectedRoute.jsx";

import LogIn from "./pages/SignUp_Login/LogIn.jsx";
import SignUp from "./pages/SignUp_Login/SignUp.jsx";
import ClientSurvey from "./pages/SignUp_Login/ClientSurvey.jsx";
import CoachSurvey from "./pages/SignUp_Login/CoachSurvey.jsx";

import BrowseCoaches from "./pages/Coaches_ClientView/BrowseCoaches.jsx";
import ClientDashboard from "./pages/ClientDashboard/ClientDashboard.jsx";
import MyCoach from "./pages/Coaches_ClientView/MyCoach.jsx";
import CoachClientManagement from "./pages/Coaches_CoachView/ClientManagement.jsx";
import Workouts from "./pages/Workouts/Workouts.jsx";
import Nutrition from "./pages/Nutrition/nutrition.jsx";
import PaymentPage from "./pages/Payment/PaymentPage.jsx";
import EditProfile from "./pages/Profile/EditClientProfile.jsx";
import Chat from "./pages/Chat/Chat.jsx";
import CoachClientView from "./pages/Coaches_CoachView/CoachClientView.jsx";

import EditCoachProfile from "./pages/Profile/EditCoachProfile.jsx";

import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import AdminCoachApplications from "./pages/Admin/AdminCoachApplications.jsx";
import AdminExerciseBankView from "./pages/AdminExerciseBank/AdminExerciseBankView.jsx";
import CoachDashboard from "./pages/Coaches/CoachDashboard.jsx";
import CoachReports from "./pages/Admin/CoachReports.jsx";

const App = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/visitorExerciseBank"
          element={<VisitorExerciseBankView />}
        />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route element={<RoleProtectedRoute requiredRoles={["client"]} />}>
          <Route path="/clientDashboard" element={<ClientDashboard />} />
          <Route path="/coaches/browse" element={<BrowseCoaches />} />
          <Route path="/coaches/my-coach" element={<MyCoach />} />
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
          <Route path="/coachDashboard" element={<CoachDashboard />} />
          <Route path="/clientManagement" element={<CoachClientManagement />} />
          <Route
            path="/clientManagement/:clientId/view"
            element={<CoachClientView />}
          />
          <Route path="/assignWorkouts" element={<Workouts />} />
          <Route path="/coachProfile" element={<EditCoachProfile />} />
        </Route>

        <Route element={<RoleProtectedRoute requiredRoles={["admin"]} />}>
          <Route path="/adminDashboard" element={<AdminDashboard />} />
          <Route
            path="/admin/exercise-bank"
            element={<AdminExerciseBankView />}
          />
          <Route
            path="/admin/coach-applications"
            element={<AdminCoachApplications />}
          />
          <Route path="/admin/reports" element={<CoachReports />} />
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
