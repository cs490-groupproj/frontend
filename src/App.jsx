import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import SignIn from "./components/SignIn.jsx";
import SignUp from "./components/SignUp.jsx";
import ClientSurvey from "./components/ClientSurvey.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ClientDashboard from "./components/ClientDashboard.jsx";
import BrowseCoaches from "./components/BrowseCoaches.jsx";


const App = () => {
  return (
   <BrowserRouter>
      <div className="flex min-h-screen bg-background text-foreground">
        
      
        <Sidebar />
        
  
        <main className="flex-1 p-8 overflow-y-auto">
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/clientsurvey" element={<ClientSurvey />} />
        <Route path="/pathname1" element={<div>Navigation component</div>} />
        <Route path="/pathname2" element={<div>Navigation component</div>} />
        <Route path="/" element={<ClientDashboard />} />
        <Route path="/coaches" element={<BrowseCoaches />} />
        <Route path="/exercises" element={<div className="p-4">Exercises Content</div>} />
        <Route path="/payment" element={<div className="p-4">Payment Content</div>} />
        <Route path="/profile" element={<div className="p-4">Edit Profile Content</div>} />
        <Route path="/chat" element={<div className="p-4">Chat Content</div>} /> 
      </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};



export default App;