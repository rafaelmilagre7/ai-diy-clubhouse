
import { Routes, Route, Navigate } from 'react-router-dom';
import { authRoutes } from '../../routes/AuthRoutes';
import { adminRoutes } from '../../routes/AdminRoutes';
import { memberRoutes } from '../../routes/MemberRoutes';
import { onboardingRoutes } from '../../routes/OnboardingRoutes';
import { formacaoRoutes } from '../../routes/FormacaoRoutes';
import NotFound from '@/pages/NotFound';
import InvitePage from '@/pages/InvitePage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Convite Routes - Adicionado no início para maior prioridade */}
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
