
import { Routes, Route } from 'react-router-dom';
import { authRoutes } from '../../routes/AuthRoutes';
import { adminRoutes } from '../../routes/AdminRoutes';
import { MemberRoutes } from '../../auth/MemberRoutes';
import { OnboardingRoutes } from '../../routes/OnboardingRoutes';
import { formacaoRoutes } from '../../routes/FormacaoRoutes';
import { CommunityRedirects } from './CommunityRedirects';
import { SmartRoutePreloader } from './SmartRoutePreloader';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import NotFound from '@/pages/NotFound';
import InvitePage from '@/pages/InvitePage';

const AppRoutes = () => {
  return (
    <>
      <CommunityRedirects />
      <SmartRoutePreloader />
      
      <Routes>
        {/* Convite Routes */}
        <Route path="/convite/:token" element={<InvitePage />} />
        <Route path="/convite" element={<InvitePage />} />
        
        {/* Auth Routes */}
        {authRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* CORREÇÃO CRÍTICA: Admin Routes ANTES do catch-all */}
        {adminRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Formação Routes */}
        {formacaoRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Onboarding Routes */}
        <Route path="/onboarding-new/*" element={<OnboardingRoutes />} />
        
        {/* CORREÇÃO: Member Routes como catch-all POR ÚLTIMO */}
        <Route path="/*" element={
          <ProtectedRoutes>
            <MemberRoutes />
          </ProtectedRoutes>
        } />
        
        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
