import React from "react";
import { useLocation, Routes, Route } from "react-router-dom";
import { WeightliftingIcon } from "./components/icons/guidance-weightlifting.jsx";
import BrowseCoaches from "./components/BrowseCoaches.jsx";
import ClientDashboard from "./components/ClientDashboard.jsx";
import ClientSurvey from "./components/ClientSurvey.jsx";
import LandingPage from "./pages/LandingPage/LandingPage.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import SignIn from "./components/SignIn.jsx";
import SignUp from "./components/SignUp.jsx";

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
      pathTitle: "Sign In",
      path: "/signin",
      type: "btn",
      size: "lg",
      variant: "default",
    },
  ],
};

const App = () => {
  const location = useLocation();
  const showNavbar = location.pathname === "/";
  const showSidebar = location.pathname !== "/";
  return (
    <div className="bg-background text-foreground flex min-h-screen">
      {showSidebar && <Sidebar />}
      {showNavbar && <Navbar navbar_contents={navbar_contents} />}

      <main className="flex-1 overflow-y-auto p-8">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/clientdashboard" element={<ClientDashboard />} />
          <Route path="/clientsurvey" element={<ClientSurvey />} />
          <Route path="/coaches" element={<BrowseCoaches />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/exercises" element={<div>Exercises</div>} />
          <Route path="/payment" element={<div>Payment</div>} />
          <Route path="/profile" element={<div>profile</div>} />
          <Route path="/chat" element={<div>Chat Content</div>} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
