
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { authRoutes } from './AuthRoutes';
import { adminRoutes } from './AdminRoutes';
import { memberRoutes } from './MemberRoutes';
import { formacaoRoutes } from './FormacaoRoutes';
import { certificateRoutes } from './CertificateRoutes';
import { CommunityRedirects } from '@/components/routing/CommunityRedirects';
import { TokenRedirectHandler } from '@/components/auth/TokenRedirectHandler';
import NotFound from '@/pages/NotFound';
import InvitePage from '@/pages/InvitePage';
import AcceptInvite from '@/pages/AcceptInvite';
import OnboardingPage from '@/pages/OnboardingPage';
import AulaView from '@/pages/formacao/aulas/AulaView';

const AppRoutes = () => {
  const location = useLocation();
  
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
        <Route path="/onboarding" element={<OnboardingPage />} />
        
        {/* Convite Routes - Alta prioridade e fora do sistema de autenticação */}
        <Route path="/convite/:token" element={<InvitePage />} />
        <Route path="/convite" element={<InvitePage />} />
        <Route path="/accept-invite/:token" element={<AcceptInvite />} />
        
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
        <Route path="/formacao/aulas/view/:cursoId/:aulaId" element={<AulaView />} />
        
        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
