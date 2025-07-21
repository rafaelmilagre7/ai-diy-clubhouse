
import React from "react";
import { Routes, Route } from "react-router-dom";
import MemberLayout from "@/components/layout/MemberLayout";
// import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import Dashboard from "@/pages/member/Dashboard";
import Solutions from "@/pages/member/Solutions";
import SolutionDetails from "@/pages/member/SolutionDetails";
import SolutionImplementation from "@/pages/member/implementation/SolutionImplementation";
import Networking from "@/pages/member/Networking";
import Profile from "@/pages/member/Profile";
import Benefits from "@/pages/member/Benefits";
// import Community from "@/pages/member/Community";
// import CommunityTopic from "@/pages/member/CommunityTopic";

export const MemberRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MemberLayout><div /></MemberLayout>}>
        <Route index element={<Dashboard />} />
        <Route path="solutions" element={<Solutions />} />
        <Route path="solution/:id" element={<SolutionDetails />} />
        
        {/* Unified implementation route */}
        <Route path="implement/:id" element={<SolutionImplementation />} />
        
        <Route path="networking" element={<Networking />} />
        <Route path="profile" element={<Profile />} />
        <Route path="benefits" element={<Benefits />} />
        {/* <Route path="community" element={<Community />} />
        <Route path="community/topic/:id" element={<CommunityTopic />} /> */}
      </Route>
    </Routes>
  );
};
