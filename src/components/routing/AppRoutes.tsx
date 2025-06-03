
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import LoadingScreen from '@/components/common/LoadingScreen';
import { lazy, Suspense } from 'react';

// Lazy loading das páginas principais
const OptimizedDashboard = lazy(() => import('@/pages/member/OptimizedDashboard'));
const Solutions = lazy(() => import('@/pages/member/Solutions'));
const Profile = lazy(() => import('@/pages/member/Profile'));
const Tools = lazy(() => import('@/pages/member/Tools'));
const Learning = lazy(() => import('@/pages/member/learning/LearningPage'));
const Community = lazy(() => import('@/pages/member/community/CommunityPage'));
const Networking = lazy(() => import('@/pages/member/networking/NetworkingPage'));
const ImplementationTrail = lazy(() => import('@/pages/member/ImplementationTrailPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Onboarding
const NovoOnboardingNew = lazy(() => import('@/pages/onboarding/NovoOnboardingNew'));
const SimpleOnboardingPage = lazy(() => import('@/pages/onboarding/SimpleOnboardingPage'));
const OnboardingCompleted = lazy(() => import('@/components/onboarding/OnboardingCompletedNew'));

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));

// Formação
const FormacaoDashboard = lazy(() => import('@/pages/formacao/FormacaoDashboard'));

const AppRoutes = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Dashboard principal */}
        <Route path="/dashboard" element={<OptimizedDashboard />} />
        
        {/* Onboarding */}
        <Route path="/onboarding-new" element={<NovoOnboardingNew />} />
        <Route path="/simple-onboarding" element={<SimpleOnboardingPage />} />
        <Route path="/onboarding-new/completed" element={<OnboardingCompleted />} />
        
        {/* Páginas principais */}
        <Route path="/solucoes" element={<Solutions />} />
        <Route path="/trilha-implementacao" element={<ImplementationTrail />} />
        <Route path="/ferramentas" element={<Tools />} />
        <Route path="/aprendizado" element={<Learning />} />
        <Route path="/aprendizado/*" element={<Learning />} />
        <Route path="/comunidade" element={<Community />} />
        <Route path="/comunidade/*" element={<Community />} />
        <Route path="/networking" element={<Networking />} />
        <Route path="/perfil" element={<Profile />} />
        
        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        
        {/* Formação */}
        <Route path="/formacao" element={<FormacaoDashboard />} />
        <Route path="/formacao/*" element={<FormacaoDashboard />} />
        
        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
