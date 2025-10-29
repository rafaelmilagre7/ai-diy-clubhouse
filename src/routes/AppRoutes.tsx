
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { adminRoutes } from './AdminRoutes';
import { memberRoutes } from './MemberRoutes';
import { authRoutes } from './AuthRoutes';
import { formacaoRoutes } from './FormacaoRoutes';
import { certificateRoutes } from './CertificateRoutes';
import { CommunityRedirects } from '@/components/routing/CommunityRedirects';
import { TokenRedirectHandler } from '@/components/auth/TokenRedirectHandler';
import OptimizedLoadingScreen from '@/components/common/OptimizedLoadingScreen';

// Lazy loading de páginas para melhor performance inicial
const NotFound = lazy(() => import('@/pages/NotFound'));
const InvitePage = lazy(() => import('@/pages/InvitePage'));
const AcceptInvite = lazy(() => import('@/pages/AcceptInvite'));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const AulaView = lazy(() => import('@/pages/formacao/aulas/AulaView'));
const AuthDebug = lazy(() => import('@/pages/test/AuthDebug'));
const ToastDemo = lazy(() => import('@/pages/ToastDemo'));

const AppRoutes = () => {
  const location = useLocation();
  const [navigationEvents, setNavigationEvents] = useState<{path: string, timestamp: number}[]>([]);
  
  // Para diagnóstico - mostrar quando a rota muda
  useEffect(() => {
    console.log("AppRoutes: Navegação para rota:", location.pathname, {
      search: location.search,
      state: location.state
    });
    
    // Armazenar eventos de navegação recentes para detectar loops
    const now = Date.now();
    setNavigationEvents(prev => {
      // Adicionar evento atual
      const updated = [...prev, {path: location.pathname, timestamp: now}];
      
      // Remover eventos antigos (mais de 10 segundos)
      const filtered = updated.filter(event => now - event.timestamp < 10000);
      
      // Detectar possíveis loops
      const recentPathCounts: Record<string, number> = {};
      filtered.forEach(event => {
        recentPathCounts[event.path] = (recentPathCounts[event.path] || 0) + 1;
      });
      
      // Alertar se houver muitos eventos para a mesma rota
      Object.entries(recentPathCounts).forEach(([path, count]) => {
        if (count > 3) {
          console.warn(`AppRoutes: Possível loop de navegação detectado para a rota ${path} (${count} eventos em 10s)`);
        }
      });
      
      return filtered;
    });
  }, [location]);
  
  // Verificar se estamos em uma rota de comunidade para evitar renderizar CommunityRedirects
  // Ou em uma rota de autenticação/convite onde não precisamos do redirecionamento
  const skipRedirects = 
    location.pathname.startsWith('/comunidade') || 
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/auth') ||
    location.pathname.startsWith('/convite') ||
    location.pathname.startsWith('/accept-invite');
  
  return (
    <>
      {/* Componente auxiliar para redirecionar antigas URLs - não renderizar em rotas onde não é necessário */}
      {!skipRedirects && <CommunityRedirects />}
      
      {/* Handler para detectar tokens de reset na URL raiz */}
      <TokenRedirectHandler />
      
      <Routes>
        {/* Onboarding Route - Para novos usuários */}
        <Route path="/onboarding" element={
          <Suspense fallback={<OptimizedLoadingScreen />}>
            <OnboardingPage />
          </Suspense>
        } />
        
        {/* Convite Routes - Alta prioridade e fora do sistema de autenticação */}
        <Route path="/convite/:token" element={
          <Suspense fallback={<OptimizedLoadingScreen />}>
            <InvitePage />
          </Suspense>
        } />
        <Route path="/convite" element={
          <Suspense fallback={<OptimizedLoadingScreen />}>
            <InvitePage />
          </Suspense>
        } />
        <Route path="/accept-invite/:token" element={
          <Suspense fallback={<OptimizedLoadingScreen />}>
            <AcceptInvite />
          </Suspense>
        } />
        
        {/* Certificate Routes - Públicas */}
        {certificateRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Auth Routes - Todas usando o design escuro */}
        {authRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Member Routes - Agora incluindo a rota raiz com RootRedirect */}
        {memberRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Admin Routes */}
        {adminRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Formação Routes */}
        {formacaoRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Rota especial para visualização de aulas como membro */}
        <Route path="/formacao/aulas/view/:cursoId/:aulaId" element={
          <Suspense fallback={<OptimizedLoadingScreen />}>
            <AulaView />
          </Suspense>
        } />
        
        {/* Rota de debug de autenticação */}
        <Route path="/test/auth-debug" element={
          <Suspense fallback={<OptimizedLoadingScreen />}>
            <AuthDebug />
          </Suspense>
        } />
        
        {/* Rota de demonstração do sistema de toast moderno */}
        <Route path="/toast-demo" element={
          <Suspense fallback={<OptimizedLoadingScreen />}>
            <ToastDemo />
          </Suspense>
        } />
        
        {/* Fallback route */}
        <Route path="*" element={
          <Suspense fallback={<OptimizedLoadingScreen />}>
            <NotFound />
          </Suspense>
        } />
      </Routes>
    </>
  );
};

export default AppRoutes;
