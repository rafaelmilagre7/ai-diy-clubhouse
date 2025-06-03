
import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import LoadingScreen from '@/components/common/LoadingScreen';
import { SmartRedirectHandler } from '@/components/routing/SmartRedirectHandler';
import { SmartFeatureGuard } from '@/components/auth/SmartFeatureGuard';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';
import { FormacaoProtectedRoutes } from '@/auth/FormacaoProtectedRoutes';
import RootRedirect from '@/components/routing/RootRedirect';
import InvitePage from '@/pages/InvitePage';
import NotFound from '@/pages/NotFound';

// Auth pages
import ModernLogin from '@/pages/auth/ModernLogin';
import ResetPassword from '@/pages/auth/ResetPassword';
import SetNewPassword from '@/pages/auth/SetNewPassword';

// Member pages
import Dashboard from '@/pages/member/Dashboard';
import ImplementationTrailPage from '@/pages/member/ImplementationTrailPage';

// Route modules
import { NetworkingRoutes } from '@/routes/NetworkingRoutes';
import { CommunityRoutes } from '@/routes/CommunityRoutes';
import { SolutionsRoutes } from '@/routes/SolutionsRoutes';
import { LearningRoutes } from '@/routes/LearningRoutes';
import { ToolsRoutes } from '@/routes/ToolsRoutes';
import { BenefitsRoutes } from '@/routes/BenefitsRoutes';
import { OnboardingRoutes } from '@/routes/OnboardingRoutes';
import { AdminRoutes } from '@/routes/AdminRoutes';
import { FormacaoRoutes } from '@/routes/FormacaoRoutes';
import ProfileRoutes from '@/routes/ProfileRoutes';

const AppRoutes = () => {
  return (
    <SmartRedirectHandler>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Rotas de convite */}
          <Route path="/convite/:token" element={<InvitePage />} />
          <Route path="/convite" element={<InvitePage />} />
          
          {/* Rotas públicas */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<ModernLogin />} />
          <Route path="/register" element={<ModernLogin />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/set-new-password" element={<SetNewPassword />} />

          {/* Rotas protegidas básicas */}
          <Route path="/dashboard" element={
            <ProtectedRoutes>
              <Dashboard />
            </ProtectedRoutes>
          } />

          <Route path="/implementation-trail" element={
            <ProtectedRoutes>
              <SmartFeatureGuard feature="implementation_trail">
                <ImplementationTrailPage />
              </SmartFeatureGuard>
            </ProtectedRoutes>
          } />

          {/* Networking com guard */}
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

          {/* 404 e fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </SmartRedirectHandler>
  );
};

export default AppRoutes;
