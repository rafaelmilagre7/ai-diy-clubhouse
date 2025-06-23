
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authRoutes } from './AuthRoutes';
import { adminRoutes } from './AdminRoutes';
import { memberRoutes } from './MemberRoutes';
import { formacaoRoutes } from './FormacaoRoutes';
import { certificateRoutes } from './CertificateRoutes';
import { CommunityRedirects } from '@/components/routing/CommunityRedirects';
import NotFound from '@/pages/NotFound';
import OnboardingPage from '@/pages/OnboardingPage';
import InviteAcceptPage from '@/pages/InviteAcceptPage';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';

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
    location.pathname.startsWith('/convite');
  
  return (
    <>
      {/* Componente auxiliar para redirecionar antigas URLs - não renderizar em rotas onde não é necessário */}
      {!skipRedirects && <CommunityRedirects />}
      
      <Routes>
        {/* NOVO: Página específica para aceitar convites */}
        <Route path="/convite-aceitar" element={<InviteAcceptPage />} />
        
        {/* Redirecionamento direto de convites para a nova página */}
        <Route 
          path="/convite/:token" 
          element={<Navigate to={`/convite-aceitar?token=${window.location.pathname.split('/')[2]}`} replace />} 
        />
        <Route 
          path="/convite" 
          element={<Navigate to="/auth" replace />} 
        />
        
        {/* Certificate Routes - Públicas */}
        {certificateRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Auth Routes - Todas usando o design escuro */}
        {authRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Onboarding Route - Protegida mas sem layout */}
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoutes>
              <OnboardingPage />
            </ProtectedRoutes>
          } 
        />
        
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
        
        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
