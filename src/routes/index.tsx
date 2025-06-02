
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';
import { SmartRedirectHandler } from '@/components/routing/SmartRedirectHandler';
import { SmartFeatureGuard } from '@/components/auth/SmartFeatureGuard';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';
import { FormacaoProtectedRoutes } from '@/auth/FormacaoProtectedRoutes';
import RootRedirect from '@/components/routing/RootRedirect';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/app/DashboardPage';
import ImplementationTrailPage from '@/pages/app/ImplementationTrailPage';
import InvitePage from '@/pages/InvitePage';

// Rotas Unificadas
import { AuthRoutes } from './AuthRoutes';
import { NetworkingRoutes } from './NetworkingRoutes';
import { CommunityRoutes } from './CommunityRoutes';
import { SolutionsRoutes } from './SolutionsRoutes';
import { LearningRoutes } from './LearningRoutes';
import { ToolsRoutes } from './ToolsRoutes';
import { BenefitsRoutes } from './BenefitsRoutes';
import { OnboardingRoutes } from './OnboardingRoutes';
import { AdminRoutes } from './AdminRoutes';
import { FormacaoRoutes } from './FormacaoRoutes';
import { ProfileRoutes } from './ProfileRoutes';

export const AppRoutes = () => {
  return (
    <SmartRedirectHandler>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<RootRedirect />} />
          
          {/* Convite Routes */}
          <Route path="/convite/:token" element={<InvitePage />} />
          <Route path="/convite" element={<InvitePage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/*" element={<AuthRoutes />} />

          {/* Rotas protegidas com guards de acesso */}
          <Route path="/dashboard" element={
            <ProtectedRoutes>
              <DashboardPage />
            </ProtectedRoutes>
          } />

          <Route path="/implementation-trail" element={
            <ProtectedRoutes>
              <SmartFeatureGuard feature="implementation_trail">
                <ImplementationTrailPage />
              </SmartFeatureGuard>
            </ProtectedRoutes>
          } />

          <Route path="/networking/*" element={
            <ProtectedRoutes>
              <SmartFeatureGuard feature="networking">
                <NetworkingRoutes />
              </SmartFeatureGuard>
            </ProtectedRoutes>
          } />

          {/* Learning e Comunidade - apenas autenticação básica */}
          <Route path="/comunidade/*" element={
            <ProtectedRoutes>
              <CommunityRoutes />
            </ProtectedRoutes>
          } />

          <Route path="/learning/*" element={
            <ProtectedRoutes>
              <LearningRoutes />
            </ProtectedRoutes>
          } />

          <Route path="/solutions/*" element={
            <ProtectedRoutes>
              <SolutionsRoutes />
            </ProtectedRoutes>
          } />

          <Route path="/tools/*" element={
            <ProtectedRoutes>
              <ToolsRoutes />
            </ProtectedRoutes>
          } />

          <Route path="/benefits/*" element={
            <ProtectedRoutes>
              <BenefitsRoutes />
            </ProtectedRoutes>
          } />

          {/* Onboarding */}
          <Route path="/onboarding-new/*" element={
            <ProtectedRoutes>
              <OnboardingRoutes />
            </ProtectedRoutes>
          } />

          {/* Rotas administrativas */}
          <Route path="/admin/*" element={
            <AdminProtectedRoutes>
              <AdminRoutes />
            </AdminProtectedRoutes>
          } />

          <Route path="/formacao/*" element={
            <FormacaoProtectedRoutes>
              <FormacaoRoutes />
            </FormacaoProtectedRoutes>
          } />

          {/* Profile sempre acessível para usuários autenticados */}
          <Route path="/profile/*" element={
            <ProtectedRoutes>
              <ProfileRoutes />
            </ProtectedRoutes>
          } />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </SmartRedirectHandler>
  );
};
