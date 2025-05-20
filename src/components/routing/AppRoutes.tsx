
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { authRoutes } from '../../routes/AuthRoutes';
import { adminRoutes } from '../../routes/AdminRoutes';
import { memberRoutes } from '../../routes/MemberRoutes';
import { onboardingRoutes } from '../../routes/OnboardingRoutes';
import { formacaoRoutes } from '../../routes/FormacaoRoutes';
import { CommunityRedirects } from './CommunityRedirects';
import NotFound from '@/pages/NotFound';
import InvitePage from '@/pages/InvitePage';

const AppRoutes = () => {
  const location = useLocation();
  
  // Para diagnóstico - mostrar quando a rota muda
  useEffect(() => {
    console.log("AppRoutes: Navegação para rota:", location.pathname, {
      search: location.search,
      state: location.state
    });
  }, [location]);
  
  return (
    <>
      {/* Componente auxiliar para redirecionar antigas URLs */}
      <CommunityRedirects />
      
      <Routes>
        {/* Convite Routes - Alta prioridade e fora do sistema de autenticação */}
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
    </>
  );
};

export default AppRoutes;
