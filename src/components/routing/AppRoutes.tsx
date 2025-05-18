
import { Routes, Route } from 'react-router-dom';
import { authRoutes } from '../../routes/AuthRoutes';
import { adminRoutes } from '../../routes/AdminRoutes';
import { memberRoutes } from '../../routes/MemberRoutes';
import { onboardingRoutes } from '../../routes/OnboardingRoutes';
import { formacaoRoutes } from '../../routes/FormacaoRoutes';
import NotFound from '@/pages/NotFound';
import InvitePage from '@/pages/InvitePage';

const AppRoutes = () => {
  // Verificar se estamos em uma rota já definida no App.tsx principal
  const currentPath = window.location.pathname;
  const isForumRoute = currentPath.startsWith('/forum');
  const isDashboardRoute = currentPath === '/' || currentPath === '/dashboard';
  const isAdminForumRoute = currentPath === '/admin/forum';
  
  // Se for uma rota já definida no App.tsx principal, não renderizar nada
  if (isForumRoute || isDashboardRoute || isAdminForumRoute) {
    return null;
  }

  return (
    <Routes>
      {/* Convite Routes - Alta prioridade e fora do sistema de autenticação */}
      <Route path="/convite/:token" element={<InvitePage />} />
      <Route path="/convite" element={<InvitePage />} />
      
      {/* Auth Routes */}
      {authRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Member Routes - Excluindo rotas já definidas no App.tsx */}
      {memberRoutes
        .filter(route => route.path !== '/' && route.path !== '/dashboard')
        .map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      
      {/* Admin Routes */}
      {adminRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Onboarding Routes */}
      {onboardingRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Formação Routes */}
      {formacaoRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
