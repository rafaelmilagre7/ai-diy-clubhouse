
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { authRoutes } from './AuthRoutes';
import { adminRoutes } from './AdminRoutes';
import { memberRoutes } from './MemberRoutes';
import { onboardingRoutes } from './OnboardingRoutes';
import { formacaoRoutes } from './FormacaoRoutes';
import { CommunityRedirects } from '../components/routing/CommunityRedirects';
import NotFound from '../pages/NotFound';
import InvitePage from '../pages/InvitePage';
import RootRedirect from '../components/routing/RootRedirect';

export const AppRoutes = () => {
  console.log("AppRoutes renderizando");
  
  return (
    <>
      {/* Componente auxiliar para redirecionar antigas URLs */}
      <CommunityRedirects />
      
      <Routes>
        {/* Rota raiz - redireciona baseado na autenticação */}
        <Route path="/" element={<RootRedirect />} />
        
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
