
import { Fragment } from "react";
import { Route } from "react-router-dom";
import Dashboard from "@/pages/member/Dashboard";
import Solutions from "@/pages/member/Solutions";
import SolutionDetails from "@/pages/member/SolutionDetails";
import SolutionImplementation from "@/pages/member/SolutionImplementation";
import ImplementationConfirmation from "@/pages/member/ImplementationConfirmation";
import ImplementationCompleted from "@/pages/member/ImplementationCompleted";
import Achievements from "@/pages/member/Achievements";
import ProfileSettings from "@/pages/member/Profile";
import MemberSolutionRedirect from "@/components/routing/MemberSolutionRedirect";
import Suggestions from "@/pages/member/Suggestions";
import SuggestionDetails from "@/pages/member/SuggestionDetails";

export const memberRoutes = (
  <Fragment>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/solutions" element={<Solutions />} />
    <Route path="/solutions/:id" element={<SolutionDetails />} />
    <Route path="/solutions/:id/implementation" element={<SolutionImplementation />} />
    <Route path="/solutions/:id/implementation/confirm" element={<ImplementationConfirmation />} />
    <Route path="/solutions/:id/implementation/completed" element={<ImplementationCompleted />} />
    <Route path="/profile" element={<ProfileSettings />} />
    <Route path="/achievements" element={<Achievements />} />
    <Route path="/suggestions" element={<Suggestions />} />
    <Route path="/suggestions/:id" element={<SuggestionDetails />} />
    
    {/* Redirecionamento para URLs antigas */}
    <Route path="/solution/:id" element={<MemberSolutionRedirect />} />
  </Fragment>
);
