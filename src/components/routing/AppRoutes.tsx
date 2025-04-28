
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
import AdminOnboarding from '@/pages/admin/AdminOnboarding';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminSolutionCreate from '@/pages/admin/AdminSolutionCreate';
import AdminSolutionEdit from '@/pages/admin/AdminSolutionEdit';
import SolutionEditor from '@/pages/admin/SolutionEditor';
import AdminToolEdit from '@/pages/admin/AdminToolEdit';
import AdminSuggestionDetails from '@/pages/admin/AdminSuggestionDetails';
import Dashboard from '@/pages/member/Dashboard';
import Solutions from '@/pages/member/Solutions';
import Tools from '@/pages/member/Tools';
import ToolDetails from '@/pages/member/ToolDetails';
import Profile from '@/pages/member/Profile';
import EditProfile from '@/pages/member/EditProfile';
import SolutionDetails from '@/pages/member/SolutionDetails';
import SolutionImplementation from '@/pages/member/SolutionImplementation';
import ImplementationCompleted from '@/pages/member/ImplementationCompleted';
import Benefits from '@/pages/member/Benefits';
import Achievements from '@/pages/member/Achievements';
import Events from '@/pages/member/Events';
import Suggestions from '@/pages/member/Suggestions';
import SuggestionDetails from '@/pages/member/SuggestionDetails';
import NewSuggestion from '@/pages/member/NewSuggestion';
import { Navigate } from 'react-router-dom';
import MemberLayout from '@/components/layout/MemberLayout';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import ImplementationTrailPage from '@/pages/member/ImplementationTrailPage';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminLearningPage from '@/pages/admin/learning/index';
import CourseDetails from '@/pages/admin/learning/[id]';
import ModuleDetails from '@/pages/admin/learning/module/[id]';
import OnboardingIntro from '@/pages/onboarding/OnboardingIntro';
import Onboarding from '@/pages/onboarding/Onboarding';

const AppRoutes = () => {
  console.log("Renderizando AppRoutes");
  
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
      <Route path="/implementation-trail" element={<ProtectedRoutes><MemberLayout><ImplementationTrailPage /></MemberLayout></ProtectedRoutes>} />
      <Route path="/solutions" element={<ProtectedRoutes><MemberLayout><Solutions /></MemberLayout></ProtectedRoutes>} />
      <Route path="/tools" element={<ProtectedRoutes><MemberLayout><Tools /></MemberLayout></ProtectedRoutes>} />
      <Route path="/tools/:id" element={<ProtectedRoutes><MemberLayout><ToolDetails /></MemberLayout></ProtectedRoutes>} />
      <Route path="/profile" element={<ProtectedRoutes><MemberLayout><Profile /></MemberLayout></ProtectedRoutes>} />
      <Route path="/profile/edit" element={<ProtectedRoutes><MemberLayout><EditProfile /></MemberLayout></ProtectedRoutes>} />
      <Route path="/solution/:id" element={<ProtectedRoutes><MemberLayout><SolutionDetails /></MemberLayout></ProtectedRoutes>} />
      <Route path="/implement/:id/:moduleIdx" element={<ProtectedRoutes><MemberLayout><SolutionImplementation /></MemberLayout></ProtectedRoutes>} />
      <Route path="/implementation/:id" element={<ProtectedRoutes><MemberLayout><SolutionImplementation /></MemberLayout></ProtectedRoutes>} />
      <Route path="/implementation/:id/:moduleIdx" element={<ProtectedRoutes><MemberLayout><SolutionImplementation /></MemberLayout></ProtectedRoutes>} />
      <Route path="/implementation/completed/:id" element={<ProtectedRoutes><MemberLayout><ImplementationCompleted /></MemberLayout></ProtectedRoutes>} />
      <Route path="/benefits" element={<ProtectedRoutes><MemberLayout><Benefits /></MemberLayout></ProtectedRoutes>} />
      <Route path="/achievements" element={<ProtectedRoutes><MemberLayout><Achievements /></MemberLayout></ProtectedRoutes>} />
      <Route path="/events" element={<ProtectedRoutes><MemberLayout><Events /></MemberLayout></ProtectedRoutes>} />
      
      {/* Sugestões Routes */}
      <Route path="/suggestions" element={<ProtectedRoutes><MemberLayout><Suggestions /></MemberLayout></ProtectedRoutes>} />
      <Route path="/suggestions/:id" element={<ProtectedRoutes><MemberLayout><SuggestionDetails /></MemberLayout></ProtectedRoutes>} />
      <Route path="/suggestions/new" element={<ProtectedRoutes><MemberLayout><NewSuggestion /></MemberLayout></ProtectedRoutes>} />
      
      {/* Onboarding Routes */}
      <Route path="/onboarding" element={<ProtectedRoutes><OnboardingIntro /></ProtectedRoutes>} />
      <Route path="/onboarding/*" element={<ProtectedRoutes><Onboarding /></ProtectedRoutes>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/learning" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminLearningPage />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/learning/:id" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <CourseDetails />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/learning/module/:id" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <ModuleDetails />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/events" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminEvents />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/users" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminUsers />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/solutions" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminSolutions />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/solutions/new" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminSolutionCreate />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/solutions/:id" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminSolutionEdit />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/solutions/:id/editor" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <SolutionEditor />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/tools" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminTools />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/tools/new" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminToolEdit />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/tools/:id" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminToolEdit />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/suggestions" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminSuggestions />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/suggestions/:id" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminSuggestionDetails />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/onboarding" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminOnboarding />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/analytics" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminAnalytics />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      
      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
