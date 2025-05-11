
import { Routes, Route, Navigate } from 'react-router-dom';
import { authRoutes } from './AuthRoutes';
import { adminRoutes } from './AdminRoutes';
import { memberRoutes } from './MemberRoutes';
import { onboardingRoutes } from './OnboardingRoutes';
import { formacaoRoutes } from './FormacaoRoutes';
import NotFound from '@/pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      {authRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Member Routes */}
      {memberRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Admin Routes */}
      {adminRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Onboarding Routes */}
      {onboardingRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Formação Routes */}
      {formacaoRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
