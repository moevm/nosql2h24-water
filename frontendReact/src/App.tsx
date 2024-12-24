import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import MainMenu from "./pages/MainMenu.tsx";
import MapPage from "./pages/MapPage.tsx";
import Profile from "./pages/Profile.tsx";
import ImportExport from "./pages/ImportExport.tsx";
import Statistics from "./pages/Statistics.tsx";
import Support from "./pages/Support.tsx";
import NewPassword from "./pages/NewPassword.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import Settings from "./pages/Settings.tsx";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/map" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main-menu" element={<MainMenu />} />
        <Route path="/" element={<MapPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/import-export" element={<ImportExport />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/support" element={<Support />} />
         <Route path="/new-password" element={<NewPassword />} />
  	<Route path="/forgot-password" element={<ForgotPassword />} />	
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
};

export default App;

