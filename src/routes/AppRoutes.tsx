
import { Routes, Route } from 'react-router-dom';
import { authRoutes } from './AuthRoutes';
import { adminRoutes } from './AdminRoutes';
import { memberRoutes } from './MemberRoutes';
import { OnboardingRoutes } from './OnboardingRoutes';
import { formacaoRoutes } from './FormacaoRoutes';
import NotFound from '@/pages/NotFound';
import InvitePage from '@/pages/InvitePage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Convite Routes */}
      <Route path="/convite/:token" element={<InvitePage />} />
      <Route path="/convite" element={<InvitePage />} />
      
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
      <Route path="/onboarding-new/*" element={<OnboardingRoutes />} />
      
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
