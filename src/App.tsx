import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Onboarding from './pages/onboarding/Onboarding';
import PersonalInfo from './pages/onboarding/steps/PersonalInfo';
import ProfessionalData from './pages/onboarding/steps/ProfessionalData';
import BusinessContext from './pages/onboarding/steps/BusinessContext';
import AIExperience from './pages/onboarding/steps/AIExperience';
import BusinessGoals from './pages/onboarding/steps/BusinessGoals';
import ExperiencePersonalization from './pages/onboarding/steps/ExperiencePersonalization';
import ComplementaryInfo from './pages/onboarding/steps/ComplementaryInfo';
import Review from './pages/onboarding/steps/Review';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import Settings from './pages/settings/Settings';
import NotFound from './pages/errors/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import { AuthProvider } from './contexts/auth';
import { ThemeProvider } from './contexts/theme';
import ImplementationTrail from './pages/implementation-trail/ImplementationTrail';
import TrailGeneration from './pages/onboarding/steps/TrailGeneration';
import { Toaster } from './components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { LoggingProvider } from './contexts/logging';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LoggingProvider>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Onboarding Routes */}
                <Route path="/onboarding" element={<PersonalInfo />} />
                <Route path="/onboarding/professional-data" element={<ProfessionalData />} />
                <Route path="/onboarding/business-context" element={<BusinessContext />} />
                <Route path="/onboarding/ai-experience" element={<AIExperience />} />
                <Route path="/onboarding/club-goals" element={<BusinessGoals />} />
                <Route path="/onboarding/customization" element={<ExperiencePersonalization />} />
                <Route path="/onboarding/complementary" element={<ComplementaryInfo />} />
                <Route path="/onboarding/review" element={<Review />} />
                <Route path="/onboarding/trail-generation" element={<TrailGeneration />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/implementation-trail" element={<ProtectedRoute><ImplementationTrail /></ProtectedRoute>} />
                
                {/* Fallback Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster position="top-right" />
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </LoggingProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
