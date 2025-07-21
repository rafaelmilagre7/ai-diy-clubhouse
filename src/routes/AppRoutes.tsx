
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authRoutes } from './AuthRoutes';
import { adminRoutes } from './AdminRoutes';
import { MemberRoutes } from './MemberRoutes';
import { formacaoRoutes } from './FormacaoRoutes';
import { certificateRoutes } from './CertificateRoutes';
import { CommunityRedirects } from '@/components/routing/CommunityRedirects';
import NotFound from '@/pages/NotFound';
import InvitePage from '@/pages/InvitePage';

const AppRoutes = () => {
  const location = useLocation();
  const [navigationEvents, setNavigationEvents] = useState<{path: string, timestamp: number}[]>([]);
  
  // Para diagnóstico - mostrar quando a rota muda
  useEffect(() => {
    console.log("🔄 [APP-ROUTES] Navegação para rota:", location.pathname, {
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
          console.warn(`🚨 [APP-ROUTES] Possível loop de navegação detectado para a rota ${path} (${count} eventos em 10s)`);
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
        {/* Redirect root para dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Convite Routes - Alta prioridade e fora do sistema de autenticação */}
        <Route path="/convite/:token" element={<InvitePage />} />
        <Route path="/convite" element={<InvitePage />} />
        
        {/* Certificate Routes - Públicas */}
        {certificateRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Auth Routes - Todas usando o design escuro */}
        {authRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Member Routes - Rotas específicas ao invés de /* */}
        <Route path="/dashboard" element={<MemberRoutes />} />
        <Route path="/solutions" element={<MemberRoutes />} />
        <Route path="/solution/:id" element={<MemberRoutes />} />
        <Route path="/implement/:id" element={<MemberRoutes />} />
        <Route path="/networking" element={<MemberRoutes />} />
        <Route path="/profile" element={<MemberRoutes />} />
        <Route path="/benefits" element={<MemberRoutes />} />
        
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
