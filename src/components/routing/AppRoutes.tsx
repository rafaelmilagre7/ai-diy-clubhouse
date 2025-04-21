
import { Routes, Route } from 'react-router-dom';
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ResetPassword from '@/pages/auth/ResetPassword';
import SetNewPassword from '@/pages/auth/SetNewPassword';
import NotFound from '@/pages/NotFound';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminSolutions from '@/pages/admin/AdminSolutions';
import AdminTools from '@/pages/admin/AdminTools';
import AdminSuggestions from '@/pages/admin/AdminSuggestions';
import Dashboard from '@/pages/member/Dashboard';
import Solutions from '@/pages/member/Solutions';
import Tools from '@/pages/member/Tools';
import ToolDetails from '@/pages/member/ToolDetails';
import Profile from '@/pages/member/Profile';
import EditProfile from '@/pages/member/EditProfile';
import SolutionDetails from '@/pages/member/SolutionDetails';
import SolutionImplementation from '@/pages/member/SolutionImplementation';
import ImplementationCompleted from '@/pages/member/ImplementationCompleted';
import Onboarding from '@/pages/onboarding/Onboarding';
import BusinessGoals from '@/pages/onboarding/steps/BusinessGoals';
import BusinessContext from '@/pages/onboarding/steps/BusinessContext';
import AIExperience from '@/pages/onboarding/steps/AIExperience';
import IndustryFocus from '@/pages/onboarding/steps/IndustryFocus';
import ResourcesNeeds from '@/pages/onboarding/steps/ResourcesNeeds';
import TeamInfo from '@/pages/onboarding/steps/TeamInfo';
import Preferences from '@/pages/onboarding/steps/Preferences';
import Benefits from '@/pages/member/Benefits';
import { Navigate } from 'react-router-dom';
import MemberLayout from '@/components/layout/MemberLayout';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/set-new-password" element={<SetNewPassword />} />
      
      {/* Member Routes with Layout */}
      <Route path="/" element={<ProtectedRoutes><MemberLayout><Dashboard /></MemberLayout></ProtectedRoutes>} />
      <Route path="/dashboard" element={<ProtectedRoutes><MemberLayout><Dashboard /></MemberLayout></ProtectedRoutes>} />
      <Route path="/solutions" element={<ProtectedRoutes><MemberLayout><Solutions /></MemberLayout></ProtectedRoutes>} />
      <Route path="/tools" element={<ProtectedRoutes><MemberLayout><Tools /></MemberLayout></ProtectedRoutes>} />
      <Route path="/tools/:id" element={<ProtectedRoutes><MemberLayout><ToolDetails /></MemberLayout></ProtectedRoutes>} />
      <Route path="/profile" element={<ProtectedRoutes><MemberLayout><Profile /></MemberLayout></ProtectedRoutes>} />
      <Route path="/profile/edit" element={<ProtectedRoutes><MemberLayout><EditProfile /></MemberLayout></ProtectedRoutes>} />
      <Route path="/solution/:id" element={<ProtectedRoutes><MemberLayout><SolutionDetails /></MemberLayout></ProtectedRoutes>} />
      <Route path="/implementation/:id" element={<ProtectedRoutes><MemberLayout><SolutionImplementation /></MemberLayout></ProtectedRoutes>} />
      <Route path="/implementation/completed/:id" element={<ProtectedRoutes><MemberLayout><ImplementationCompleted /></MemberLayout></ProtectedRoutes>} />
      <Route path="/benefits" element={<ProtectedRoutes><MemberLayout><Benefits /></MemberLayout></ProtectedRoutes>} />
      
      {/* Onboarding Routes */}
      <Route path="/onboarding" element={<ProtectedRoutes><Onboarding /></ProtectedRoutes>} />
      <Route path="/onboarding/business-goals" element={<ProtectedRoutes><BusinessGoals /></ProtectedRoutes>} />
      <Route path="/onboarding/business-context" element={<ProtectedRoutes><BusinessContext /></ProtectedRoutes>} />
      <Route path="/onboarding/ai-experience" element={<ProtectedRoutes><AIExperience /></ProtectedRoutes>} />
      <Route path="/onboarding/industry-focus" element={<ProtectedRoutes><IndustryFocus /></ProtectedRoutes>} />
      <Route path="/onboarding/resources-needs" element={<ProtectedRoutes><ResourcesNeeds /></ProtectedRoutes>} />
      <Route path="/onboarding/team-info" element={<ProtectedRoutes><TeamInfo /></ProtectedRoutes>} />
      <Route path="/onboarding/preferences" element={<ProtectedRoutes><Preferences /></ProtectedRoutes>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminProtectedRoutes><AdminDashboard /></AdminProtectedRoutes>} />
      <Route path="/admin/users" element={<AdminProtectedRoutes><AdminUsers /></AdminProtectedRoutes>} />
      <Route path="/admin/solutions" element={<AdminProtectedRoutes><AdminSolutions /></AdminProtectedRoutes>} />
      <Route path="/admin/tools" element={<AdminProtectedRoutes><AdminTools /></AdminProtectedRoutes>} />
      <Route path="/admin/suggestions" element={<AdminProtectedRoutes><AdminSuggestions /></AdminProtectedRoutes>} />
      
      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
