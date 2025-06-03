
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { LegacyRouteRedirects } from './LegacyRouteRedirects';
import LoadingScreen from '@/components/common/LoadingScreen';
import { lazy, Suspense } from 'react';

// Lazy loading das páginas
const OptimizedDashboard = lazy(() => import('@/pages/member/OptimizedDashboard'));
const SolutionDetails = lazy(() => import('@/pages/member/SolutionDetails'));
const SolutionImplementation = lazy(() => import('@/pages/member/SolutionImplementation'));
const Solutions = lazy(() => import('@/pages/member/Solutions'));
const Profile = lazy(() => import('@/pages/member/Profile'));
const Tools = lazy(() => import('@/pages/member/Tools'));
const Benefits = lazy(() => import('@/pages/member/Benefits'));
const Events = lazy(() => import('@/pages/member/Events'));
const Learning = lazy(() => import('@/pages/member/Learning'));
const Community = lazy(() => import('@/pages/member/Community'));
const Networking = lazy(() => import('@/pages/member/Networking'));
const ImplementationTrail = lazy(() => import('@/pages/member/ImplementationTrail'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminSolutions = lazy(() => import('@/pages/admin/AdminSolutions'));
const AdminSolutionEdit = lazy(() => import('@/pages/admin/AdminSolutionEdit'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminTools = lazy(() => import('@/pages/admin/AdminTools'));
const AdminEvents = lazy(() => import('@/pages/admin/AdminEvents'));
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));
const AdminRoles = lazy(() => import('@/pages/admin/AdminRoles'));

// Formação pages
const FormacaoDashboard = lazy(() => import('@/pages/formacao/FormacaoDashboard'));

export const AppRoutes = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <LegacyRouteRedirects />
      <Routes>
        {/* Rotas principais em português */}
        <Route path="/dashboard" element={<OptimizedDashboard />} />
        
        {/* Soluções */}
        <Route path="/solucoes" element={<Solutions />} />
        <Route path="/solucoes/:id" element={<SolutionDetails />} />
        <Route path="/solucoes/:id/implementar" element={<SolutionImplementation />} />
        <Route path="/solucoes/:id/implementar/:moduleIdx" element={<SolutionImplementation />} />
        
        {/* Outras páginas principais */}
        <Route path="/trilha-implementacao" element={<ImplementationTrail />} />
        <Route path="/ferramentas" element={<Tools />} />
        <Route path="/beneficios" element={<Benefits />} />
        <Route path="/eventos" element={<Events />} />
        <Route path="/aprendizado" element={<Learning />} />
        <Route path="/aprendizado/*" element={<Learning />} />
        <Route path="/comunidade" element={<Community />} />
        <Route path="/comunidade/*" element={<Community />} />
        <Route path="/networking" element={<Networking />} />
        <Route path="/perfil" element={<Profile />} />
        
        {/* Rotas admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/solucoes" element={<AdminSolutions />} />
        <Route path="/admin/solucoes/nova" element={<AdminSolutionEdit />} />
        <Route path="/admin/solucoes/:id/editar" element={<AdminSolutionEdit />} />
        <Route path="/admin/usuarios" element={<AdminUsers />} />
        <Route path="/admin/ferramentas" element={<AdminTools />} />
        <Route path="/admin/eventos" element={<AdminEvents />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/roles" element={<AdminRoles />} />
        
        {/* Rotas formação */}
        <Route path="/formacao" element={<FormacaoDashboard />} />
        <Route path="/formacao/*" element={<FormacaoDashboard />} />
        
        {/* Redirects e rotas de compatibilidade */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        
        {/* Rotas antigas - redirects */}
        <Route path="/solutions" element={<Navigate to="/solucoes" replace />} />
        <Route path="/solutions/:id" element={<Navigate to="/solucoes/:id" replace />} />
        <Route path="/implementation-trail" element={<Navigate to="/trilha-implementacao" replace />} />
        <Route path="/tools" element={<Navigate to="/ferramentas" replace />} />
        <Route path="/benefits" element={<Navigate to="/beneficios" replace />} />
        <Route path="/events" element={<Navigate to="/eventos" replace />} />
        <Route path="/learning" element={<Navigate to="/aprendizado" replace />} />
        <Route path="/learning/*" element={<Navigate to="/aprendizado" replace />} />
        <Route path="/profile" element={<Navigate to="/perfil" replace />} />
        
        {/* 404 - deve estar por último */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
