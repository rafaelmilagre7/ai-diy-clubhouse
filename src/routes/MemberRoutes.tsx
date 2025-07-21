
import React from "react";
import { Routes, Route } from "react-router-dom";
import MemberLayout from "@/components/layout/MemberLayout";
import AuthProtectedRoutes from "@/components/auth/AuthProtectedRoutes";

// Pages
import Dashboard from "@/pages/member/Dashboard";
import Solutions from "@/pages/member/Solutions";
import SolutionDetails from "@/pages/member/SolutionDetails";
import SolutionImplementation from "@/pages/member/implementation/SolutionImplementation";
import Networking from "@/pages/member/Networking";
import Profile from "@/pages/member/Profile";
import Benefits from "@/pages/member/Benefits";

export const MemberRoutes = () => {
  console.log("🔧 [MEMBER-ROUTES] Componente renderizado");
  
  return (
    <AuthProtectedRoutes>
      <Routes>
        <Route path="/" element={<MemberLayout />}>
          {/* Rota específica para dashboard */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="solutions" element={<Solutions />} />
          <Route path="solution/:id" element={<SolutionDetails />} />
          
          {/* Unified implementation route */}
          <Route path="implement/:id" element={<SolutionImplementation />} />
          
          <Route path="networking" element={<Networking />} />
          <Route path="profile" element={<Profile />} />
          <Route path="benefits" element={<Benefits />} />
        </Route>
      </Routes>
    </AuthProtectedRoutes>
  );
};
