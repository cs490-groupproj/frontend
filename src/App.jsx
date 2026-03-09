import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<div>Home component</div>} />
        <Route path="/pathname1" element={<div>Navigation component</div>} />
        <Route path="/pathname2" element={<div>Navigation component</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
