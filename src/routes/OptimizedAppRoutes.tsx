
import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState, Suspense, lazy } from 'react';
import { authRoutes } from './AuthRoutes';
import { adminRoutes } from './AdminRoutes';
import { memberRoutes } from './MemberRoutes';
import { formacaoRoutes } from './FormacaoRoutes';
import { certificateRoutes } from './CertificateRoutes';
import { CommunityRedirects } from '@/components/routing/CommunityRedirects';
import NotFound from '@/pages/NotFound';
import InvitePage from '@/pages/InvitePage';
import OnboardingPage from '@/pages/OnboardingPage';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import OptimizedLoadingScreen from '@/components/common/OptimizedLoadingScreen';

// OTIMIZAÇÃO: Lazy loading para componentes pesados
const LazyDashboard = lazy(() => import('@/pages/member/Dashboard'));
const LazyAdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));

const OptimizedAppRoutes = () => {
  const location = useLocation();
  const [routeMetrics, setRouteMetrics] = useState<Record<string, number>>({});
  
  // OTIMIZAÇÃO: Métricas de performance para monitoramento
  useEffect(() => {
    const startTime = performance.now();
    
    const logRoutePerformance = () => {
      const loadTime = performance.now() - startTime;
      setRouteMetrics(prev => ({
        ...prev,
        [location.pathname]: loadTime
      }));
      
      if (import.meta.env.DEV && loadTime > 1000) {
        console.warn(`⚠️ Rota lenta detectada: ${location.pathname} (${loadTime.toFixed(2)}ms)`);
      }
    };

    // OTIMIZAÇÃO: Log de performance após render
    const timeoutId = setTimeout(logRoutePerformance, 100);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);
  
  // OTIMIZAÇÃO: Verificar se precisa de redirecionamentos de comunidade
  const skipRedirects = 
    location.pathname.startsWith('/comunidade') || 
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/auth') ||
    location.pathname.startsWith('/convite');
  
  return (
    <>
      {/* OTIMIZAÇÃO: Redirecionamentos apenas quando necessário */}
      {!skipRedirects && <CommunityRedirects />}
      
      <Suspense fallback={
        <OptimizedLoadingScreen 
          message="Carregando rota" 
          variant="dots" 
          size="md"
        />
      }>
        <Routes>
          {/* Rotas públicas - prioridade alta */}
          <Route path="/convite/:token" element={<InvitePage />} />
          <Route path="/convite" element={<InvitePage />} />
          
          {/* Certificate Routes - públicas */}
          {certificateRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          
          {/* Auth Routes */}
          {authRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          
          {/* OTIMIZAÇÃO: Onboarding com lazy loading */}
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoutes>
                <Suspense fallback={<OptimizedLoadingScreen message="Carregando onboarding" />}>
                  <OnboardingPage />
                </Suspense>
              </ProtectedRoutes>
            } 
          />
          
          {/* OTIMIZAÇÃO: Dashboard com lazy loading */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoutes>
                <Suspense fallback={<OptimizedLoadingScreen message="Carregando dashboard" />}>
                  <LazyDashboard />
                </Suspense>
              </ProtectedRoutes>
            } 
          />
          
          {/* Member Routes - otimizadas */}
          {memberRoutes.filter(route => route.path !== '/dashboard').map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          
          {/* Admin Routes - lazy loading */}
          {adminRoutes.map((route) => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={
                <Suspense fallback={<OptimizedLoadingScreen message="Carregando admin" />}>
                  {route.element}
                </Suspense>
              } 
            />
          ))}
          
          {/* Formação Routes */}
          {formacaoRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      
      {/* OTIMIZAÇÃO: Métricas de performance em DEV */}
      {import.meta.env.DEV && Object.keys(routeMetrics).length > 0 && (
        <div className="fixed bottom-2 right-2 text-xs bg-black/80 text-white p-2 rounded font-mono">
          Performance: {routeMetrics[location.pathname]?.toFixed(0)}ms
        </div>
      )}
    </>
  );
};

export default OptimizedAppRoutes;
