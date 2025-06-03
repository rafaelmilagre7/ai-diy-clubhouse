
import { Routes, Route } from 'react-router-dom';
import { authRoutes } from '../../routes/AuthRoutes';
import { adminRoutes } from '../../routes/AdminRoutes';
import { memberRoutes } from '../../routes/MemberRoutes';
import { OnboardingRoutes } from '../../routes/OnboardingRoutes';
import { FormacaoRoutes } from '../../routes/FormacaoRoutes';
import { CommunityRedirects } from './CommunityRedirects';
import { SmartRoutePreloader } from './SmartRoutePreloader';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import MemberLayout from '@/components/layout/MemberLayout';
import NotFound from '@/pages/NotFound';
import InvitePage from '@/pages/InvitePage';

// Importar páginas que já existem
import Tools from '@/pages/member/Tools';
import Events from '@/pages/member/Events';
import { CommunityRoutes } from '../../routes/CommunityRoutes';
import { SolutionsRoutes } from '../../routes/SolutionsRoutes';
import { LearningRoutes } from '../../routes/LearningRoutes';
import { NetworkingRoutes } from '../../routes/NetworkingRoutes';

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
        
        {/* Member Routes */}
        {memberRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Rotas específicas com layout */}
        <Route path="/tools" element={
          <ProtectedRoutes>
            <MemberLayout>
              <Tools />
            </MemberLayout>
          </ProtectedRoutes>
        } />
        
        <Route path="/events" element={
          <ProtectedRoutes>
            <MemberLayout>
              <Events />
            </MemberLayout>
          </ProtectedRoutes>
        } />
        
        <Route path="/benefits" element={
          <ProtectedRoutes>
            <MemberLayout>
              <Tools />
            </MemberLayout>
          </ProtectedRoutes>
        } />

        {/* Rotas de sub-sistemas */}
        <Route path="/comunidade/*" element={
          <ProtectedRoutes>
            <MemberLayout>
              <CommunityRoutes />
            </MemberLayout>
          </ProtectedRoutes>
        } />

        <Route path="/solutions/*" element={
          <ProtectedRoutes>
            <MemberLayout>
              <SolutionsRoutes />
            </MemberLayout>
          </ProtectedRoutes>
        } />

        <Route path="/learning/*" element={
          <ProtectedRoutes>
            <MemberLayout>
              <LearningRoutes />
            </MemberLayout>
          </ProtectedRoutes>
        } />

        <Route path="/networking/*" element={
          <ProtectedRoutes>
            <MemberLayout>
              <NetworkingRoutes />
            </MemberLayout>
          </ProtectedRoutes>
        } />
        
        {/* Admin Routes */}
        {adminRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Onboarding Routes */}
        <Route path="/onboarding-new/*" element={<OnboardingRoutes />} />
        
        {/* Formação Routes */}
        <Route path="/formacao/*" element={<FormacaoRoutes />} />
        
        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
