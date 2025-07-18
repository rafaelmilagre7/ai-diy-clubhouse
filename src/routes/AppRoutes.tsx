
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { authRoutes } from './AuthRoutes';
import { adminRoutes } from './AdminRoutes';
import { memberRoutes } from './MemberRoutes';
import { formacaoRoutes } from './FormacaoRoutes';
import { certificateRoutes } from './CertificateRoutes';
import { CommunityRedirects } from '@/components/routing/CommunityRedirects';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import NotFound from '@/pages/NotFound';
import InvitePage from '@/pages/InvitePage';

const AppRoutes = () => {
  const location = useLocation();
  const { currentPath } = useNavigationGuard();
  
  // Log simplificado
  console.log("AppRoutes: Rota atual:", currentPath);
  
  // Verificar se estamos em uma rota que não precisa de redirecionamentos
  const skipRedirects = 
    location.pathname.startsWith('/comunidade') || 
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/auth') ||
    location.pathname.startsWith('/convite');
  
  // Função helper para renderizar rotas de forma consistente
  const renderRoutes = (routes: any[]) => {
    return routes.map((route) => (
      <Route key={route.path} path={route.path} element={route.element}>
        {route.children?.map((child: any) => (
          <Route key={child.path} path={child.path} element={child.element} />
        ))}
      </Route>
    ));
  };
  
  return (
    <>
      {/* Componente auxiliar para redirecionar antigas URLs */}
      {!skipRedirects && <CommunityRedirects />}
      
      <Routes>
        {/* Convite Routes - Alta prioridade */}
        <Route path="/convite/:token" element={<InvitePage />} />
        <Route path="/convite" element={<InvitePage />} />
        
        {/* Certificate Routes - Públicas */}
        {renderRoutes(certificateRoutes)}
        
        {/* Auth Routes */}
        {renderRoutes(authRoutes)}
        
        {/* Member Routes */}
        {renderRoutes(memberRoutes)}
        
        {/* Admin Routes */}
        {renderRoutes(adminRoutes)}
        
        {/* Formação Routes */}
        {renderRoutes(formacaoRoutes)}
        
        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
