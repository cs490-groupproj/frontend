import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import ClientDashboard from "./components/ClientDashboard.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-background text-foreground">
        
      
        <Sidebar />
        
  
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<ClientDashboard />} />
            <Route path="/coaches" element={<div className="p-4">Browse Coaches Content</div>} />
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