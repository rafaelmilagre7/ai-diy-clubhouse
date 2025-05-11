
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthRoutes } from './AuthRoutes';
import { AdminRoutes } from './AdminRoutes';
import { MemberRoutes } from './MemberRoutes';
import { OnboardingRoutes } from './OnboardingRoutes';
import { FormacaoRoutes } from './FormacaoRoutes';
import NotFound from '@/pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <AuthRoutes />
      
      {/* Member Routes */}
      <MemberRoutes />
      
      {/* Admin Routes */}
      <AdminRoutes />
      
      {/* Onboarding Routes */}
      <OnboardingRoutes />
      
      {/* Formação Routes */}
      <FormacaoRoutes />
      
      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
