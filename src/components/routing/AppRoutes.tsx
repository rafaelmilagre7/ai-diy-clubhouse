
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

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/set-new-password" element={<SetNewPassword />} />
      
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
      
      {/* Member Routes */}
      <Route path="/dashboard" element={<ProtectedRoutes><Dashboard /></ProtectedRoutes>} />
      <Route path="/tools" element={<ProtectedRoutes><Tools /></ProtectedRoutes>} />
      <Route path="/tools/:id" element={<ProtectedRoutes><ToolDetails /></ProtectedRoutes>} />
      <Route path="/profile" element={<ProtectedRoutes><Profile /></ProtectedRoutes>} />
      <Route path="/profile/edit" element={<ProtectedRoutes><EditProfile /></ProtectedRoutes>} />
      <Route path="/solutions/:id" element={<ProtectedRoutes><SolutionDetails /></ProtectedRoutes>} />
      <Route path="/implementation/:id" element={<ProtectedRoutes><SolutionImplementation /></ProtectedRoutes>} />
      <Route path="/implementation/completed/:id" element={<ProtectedRoutes><ImplementationCompleted /></ProtectedRoutes>} />
      <Route path="/benefits" element={<ProtectedRoutes><Benefits /></ProtectedRoutes>} />
      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
