
import { Routes, Route } from 'react-router-dom';
import { authRoutes } from '../../routes/AuthRoutes';
import { adminRoutes } from '../../routes/AdminRoutes';
import { OnboardingRoutes } from '../../routes/OnboardingRoutes';
import { FormacaoRoutes } from '../../routes/FormacaoRoutes';
import { CommunityRedirects } from './CommunityRedirects';
import { SmartRoutePreloader } from './SmartRoutePreloader';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import MemberLayout from '@/components/layout/MemberLayout';
import NotFound from '@/pages/NotFound';
import InvitePage from '@/pages/InvitePage';

// Importar páginas que já existem
import OptimizedDashboard from '@/pages/member/OptimizedDashboard';
import Solutions from '@/pages/member/Solutions';
import SolutionDetails from '@/pages/member/SolutionDetails';
import ImplementationTrailPage from '@/pages/member/ImplementationTrailPage';
import Tools from '@/pages/member/Tools';
import Events from '@/pages/member/Events';
import Profile from '@/pages/member/Profile';
import { CommunityRoutes } from '../../routes/CommunityRoutes';
import { LearningRoutes } from '../../routes/LearningRoutes';
import { NetworkingRoutes } from '../../routes/NetworkingRoutes';

// Importar página de implementação
import SolutionImplementation from '@/pages/member/SolutionImplementation';

// Componente para redirects das rotas antigas
import { LegacyRouteRedirects } from './LegacyRouteRedirects';

const AppRoutes = () => {
  return (
    <>
      <CommunityRedirects />
      <SmartRoutePreloader />
      <LegacyRouteRedirects />
      
      <Routes>
        {/* Convite Routes */}
        <Route path="/convite/:token" element={<InvitePage />} />
        <Route path="/convite" element={<InvitePage />} />
        
        {/* Auth Routes */}
        {authRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoutes>
            <MemberLayout>
              <OptimizedDashboard />
            </MemberLayout>
          </ProtectedRoutes>
        } />

        {/* Soluções Routes - Nova estrutura em português */}
        <Route path="/solucoes" element={
          <ProtectedRoutes>
            <MemberLayout>
              <Solutions />
            </MemberLayout>
          </ProtectedRoutes>
        } />
        
        <Route path="/solucoes/:id" element={
          <ProtectedRoutes>
            <MemberLayout>
              <SolutionDetails />
            </MemberLayout>
          </ProtectedRoutes>
        } />
        
        <Route path="/solucoes/:id/implementar" element={
          <ProtectedRoutes>
            <SolutionImplementation />
          </ProtectedRoutes>
        } />

        <Route path="/solucoes/:id/implementar/:moduleIdx" element={
          <ProtectedRoutes>
            <SolutionImplementation />
          </ProtectedRoutes>
        } />

        {/* Trilha de Implementação */}
        <Route path="/trilha-implementacao" element={
          <ProtectedRoutes>
            <MemberLayout>
              <ImplementationTrailPage />
            </MemberLayout>
          </ProtectedRoutes>
        } />
        
        {/* Ferramentas e Benefícios */}
        <Route path="/ferramentas" element={
          <ProtectedRoutes>
            <MemberLayout>
              <Tools />
            </MemberLayout>
          </ProtectedRoutes>
        } />
        
        <Route path="/beneficios" element={
          <ProtectedRoutes>
            <MemberLayout>
              <Tools />
            </MemberLayout>
          </ProtectedRoutes>
        } />
        
        {/* Eventos */}
        <Route path="/eventos" element={
          <ProtectedRoutes>
            <MemberLayout>
              <Events />
            </MemberLayout>
          </ProtectedRoutes>
        } />

        {/* Perfil */}
        <Route path="/perfil" element={
          <ProtectedRoutes>
            <MemberLayout>
              <Profile />
            </MemberLayout>
          </ProtectedRoutes>
        } />

        {/* Sub-sistemas com rotas aninhadas - URLs em português */}
        <Route path="/comunidade/*" element={
          <ProtectedRoutes>
            <MemberLayout>
              <CommunityRoutes />
            </MemberLayout>
          </ProtectedRoutes>
        } />

        <Route path="/aprendizado/*" element={
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

        {/* Manter rotas antigas para compatibilidade - serão redirecionadas */}
        <Route path="/solutions" element={
          <ProtectedRoutes>
            <MemberLayout>
              <Solutions />
            </MemberLayout>
          </ProtectedRoutes>
        } />
        
        <Route path="/solutions/:id" element={
          <ProtectedRoutes>
            <MemberLayout>
              <SolutionDetails />
            </MemberLayout>
          </ProtectedRoutes>
        } />
        
        <Route path="/implementation-trail" element={
          <ProtectedRoutes>
            <MemberLayout>
              <ImplementationTrailPage />
            </MemberLayout>
          </ProtectedRoutes>
        } />
        
        <Route path="/tools" element={
          <ProtectedRoutes>
            <MemberLayout>
              <Tools />
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
        
        <Route path="/events" element={
          <ProtectedRoutes>
            <MemberLayout>
              <Events />
            </MemberLayout>
          </ProtectedRoutes>
        } />

        <Route path="/profile" element={
          <ProtectedRoutes>
            <MemberLayout>
              <Profile />
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
