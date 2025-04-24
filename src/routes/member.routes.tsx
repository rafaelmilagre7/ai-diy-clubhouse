
import { Fragment } from "react";
import { Route } from "react-router-dom";
import LayoutProvider from "@/components/layout/LayoutProvider";
import Dashboard from "@/pages/member/Dashboard";
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
    <Route path="/" element={<LayoutProvider><Dashboard /></LayoutProvider>} />
    <Route path="/dashboard" element={<LayoutProvider><Dashboard /></LayoutProvider>} />
    <Route path="/solutions/:id" element={<LayoutProvider><SolutionDetails /></LayoutProvider>} />
    <Route path="/solutions/:id/implementation" element={<LayoutProvider><SolutionImplementation /></LayoutProvider>} />
    <Route path="/solutions/:id/implementation/confirm" element={<LayoutProvider><ImplementationConfirmation /></LayoutProvider>} />
    <Route path="/solutions/:id/implementation/completed" element={<LayoutProvider><ImplementationCompleted /></LayoutProvider>} />
    <Route path="/profile" element={<LayoutProvider><ProfileSettings /></LayoutProvider>} />
    <Route path="/achievements" element={<LayoutProvider><Achievements /></LayoutProvider>} />
    <Route path="/suggestions" element={<LayoutProvider><Suggestions /></LayoutProvider>} />
    <Route path="/suggestions/:id" element={<LayoutProvider><SuggestionDetails /></LayoutProvider>} />
    
    {/* Redirecionamento para URLs antigas */}
    <Route path="/solution/:id" element={<MemberSolutionRedirect />} />
  </Fragment>
);
